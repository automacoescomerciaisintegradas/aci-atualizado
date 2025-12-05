import React, { useState, useCallback, useMemo, ChangeEvent } from 'react';
import { generateBlogPostWithCssFromData } from '../services/geminiService';
import { UploadIcon, FileTextIcon, MagicWandIcon, XIcon, LoaderIcon, AlertTriangleIcon, ChevronLeftIcon, ChevronRightIcon, CameraIcon, TelegramIcon, ShopeeIcon, SpinnerIcon } from './Icons';
import { useSettings } from '../hooks/useSettings';
import { publishToWordPress } from '../services/wordpressService';
import { BlogPostPreview, GeneratedPost } from './BlogPostPreview';
import { Page } from '../App';


type CsvData = {
    headers: string[];
    rows: { [key: string]: string }[];
};

interface ColumnMapping {
    Produto: string;
    Imagem: string;
    Preco: string;
    Avaliacao: string;
}

const ROWS_PER_PAGE = 10;

const validatePrice = (price: string): boolean => {
    if (!price.trim()) return true; // Optional field, valid if empty
    // Remove currency symbol, whitespace, and use dot as decimal separator
    const cleanedPrice = price.replace(/R\$\s*/, '').replace(',', '.').trim();
    const numericValue = parseFloat(cleanedPrice);
    // Check if it's a valid non-negative number
    return !isNaN(numericValue) && numericValue >= 0;
};

const MappingField: React.FC<{ name: keyof ColumnMapping, label: string, required?: boolean, headers: string[], value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }> = ({ name, label, required, headers, value, onChange }) => (
    <div>
        <label htmlFor={`map-${name}`} className="block text-sm font-medium text-dark-text-secondary mb-2">
            {label} {required && <span className="text-red-400">*</span>}
        </label>
        <select
            id={`map-${name}`}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-slate-800 border border-dark-border rounded-lg p-3 text-dark-text-primary focus:ring-2 focus:ring-brand-primary"
        >
            <option value="">Selecione uma coluna</option>
            {headers.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
    </div>
);

export const AciPage: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => {
    const [csvData, setCsvData] = useState<CsvData | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);

    const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
        Produto: '',
        Imagem: '',
        Preco: '',
        Avaliacao: '',
    });
    const [isMappingComplete, setIsMappingComplete] = useState(false);

    const [singleProduct, setSingleProduct] = useState({
        Produto: '',
        Imagem: '',
        Preco: '',
        Avaliacao: ''
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
    const [publishStates, setPublishStates] = useState<Record<number, { status: 'idle' | 'loading' | 'success' | 'error', message?: string, link?: string }>>({});

    const { settings } = useSettings();
    const isWpConfigured = useMemo(() => !!(settings.wordpressUrl && settings.wordpressUsername && settings.wordpressAppPassword), [settings]);

    const resetCsvState = () => {
        setCsvData(null);
        setFileName('');
        setSelectedRows(new Set());
        setCurrentPage(1);
        setColumnMapping({ Produto: '', Imagem: '', Preco: '', Avaliacao: '' });
        setIsMappingComplete(false);
    };

    const parseCSV = (content: string) => {
        const lines = content.trim().split(/\r\n|\n/);
        if (lines.length < 2) {
            setError("O CSV precisa ter um cabeçalho e pelo menos uma linha de dados.");
            return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const rows = lines.slice(1).map(line => {
            // A simple split might fail with commas inside quotes, but for this app it's a reasonable assumption.
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            return headers.reduce((obj, header, index) => {
                obj[header] = values[index] || '';
                return obj;
            }, {} as { [key: string]: string });
        });

        setCsvData({ headers, rows });

        // Auto-map common headers
        const newMapping: ColumnMapping = { Produto: '', Imagem: '', Preco: '', Avaliacao: '' };
        headers.forEach(header => {
            const lowerHeader = header.toLowerCase();
            if (['produto', 'nome', 'title'].some(key => lowerHeader.includes(key))) {
                if (!newMapping.Produto) newMapping.Produto = header;
            }
            if (['imagem', 'image', 'img', 'url'].some(key => lowerHeader.includes(key))) {
                if (!newMapping.Imagem) newMapping.Imagem = header;
            }
            if (['preco', 'preço', 'price', 'valor'].some(key => lowerHeader.includes(key))) {
                if (!newMapping.Preco) newMapping.Preco = header;
            }
            if (['avaliacao', 'avaliação', 'rating', 'nota', 'score'].some(key => lowerHeader.includes(key))) {
                if (!newMapping.Avaliacao) newMapping.Avaliacao = header;
            }
        });
        setColumnMapping(newMapping);

        setError(null);
        setCurrentPage(1);
        setSelectedRows(new Set());
        setIsMappingComplete(false);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            resetCsvState();
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                parseCSV(content);
            };
            reader.onerror = () => setError("Erro ao ler o arquivo.");
            reader.readAsText(file, 'UTF-8');
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type === 'text/csv') {
            resetCsvState();
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                parseCSV(content);
            };
            reader.onerror = () => setError("Erro ao ler o arquivo.");
            reader.readAsText(file, 'UTF-8');
        } else {
            setError("Por favor, solte um arquivo .csv válido.");
        }
    };

    const handleSingleProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSingleProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleMappingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setColumnMapping(prev => ({ ...prev, [name]: value }));
    };

    const handleConfirmMapping = () => {
        if (!columnMapping.Produto) {
            setError("Você deve mapear pelo menos o campo 'Nome do Produto'.");
            return;
        }
        setError(null);
        setIsMappingComplete(true);
    };

    const handleRowSelection = (index: number) => {
        const newSelection = new Set(selectedRows);
        if (newSelection.has(index)) {
            newSelection.delete(index);
        } else {
            newSelection.add(index);
        }
        setSelectedRows(newSelection);
    };

    const currentTableData = useMemo(() => {
        if (!csvData) return [];
        const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
        const endIndex = startIndex + ROWS_PER_PAGE;
        return csvData.rows.slice(startIndex, endIndex);
    }, [csvData, currentPage]);

    const handleSelectAllOnPage = () => {
        if (!csvData) return;
        const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
        const pageIndices = currentTableData.map((_, i) => startIndex + i);
        const allOnPageSelected = pageIndices.every(i => selectedRows.has(i));

        const newSelection = new Set(selectedRows);
        if (allOnPageSelected) {
            pageIndices.forEach(i => newSelection.delete(i));
        } else {
            pageIndices.forEach(i => newSelection.add(i));
        }
        setSelectedRows(newSelection);
    };

    const handleGeneratePosts = async () => {
        if (!csvData || selectedRows.size === 0) return;

        setIsModalOpen(true);
        setIsGenerating(true);
        setGeneratedPosts([]);
        setPublishStates({}); // Reset publish states

        const postsToGenerate = Array.from(selectedRows).map(index => csvData.rows[index]);
        const newPosts: GeneratedPost[] = [];

        for (const rowData of postsToGenerate) {
            const mappedData: { [key: string]: string } = {};
            if (columnMapping.Produto && rowData[columnMapping.Produto]) mappedData['Produto'] = rowData[columnMapping.Produto];
            if (columnMapping.Imagem && rowData[columnMapping.Imagem]) mappedData['Imagem'] = rowData[columnMapping.Imagem];
            if (columnMapping.Preco && rowData[columnMapping.Preco]) mappedData['Preço'] = rowData[columnMapping.Preco];
            if (columnMapping.Avaliacao && rowData[columnMapping.Avaliacao]) mappedData['Avaliação'] = rowData[columnMapping.Avaliacao];

            if (!mappedData['Produto']) {
                newPosts.push({ title: 'Post com Erro', html: '', css: '', error: 'Falha ao gerar: Nome do produto ausente nesta linha.' });
                setGeneratedPosts([...newPosts]);
                continue;
            }

            try {
                const { html, css } = await generateBlogPostWithCssFromData(mappedData);
                const title = mappedData['Produto'];
                newPosts.push({ title, html, css });
            } catch (error) {
                const title = mappedData['Produto'] || 'Post com Erro';
                newPosts.push({ title, html: '', css: '', error: 'Falha ao gerar este post.' });
            } finally {
                setGeneratedPosts([...newPosts]);
            }
        }
        setIsGenerating(false);
    };

    const handleGenerateSinglePost = async () => {
        if (!singleProduct.Produto) {
            setError("Por favor, preencha pelo menos o Nome do produto.");
            return;
        }

        if (!validatePrice(singleProduct.Preco)) {
            setError("O preço inserido é inválido. Use um formato como 'R$ 39,90' ou '39.90'.");
            return;
        }

        setError(null);
        setIsModalOpen(true);
        setIsGenerating(true);
        setGeneratedPosts([]);
        setPublishStates({}); // Reset publish states

        try {
            const dataForApi = {
                'Produto': singleProduct.Produto,
                'Imagem': singleProduct.Imagem,
                'Preço': singleProduct.Preco,
                'Avaliação': singleProduct.Avaliacao,
            };
            Object.keys(dataForApi).forEach(key => !dataForApi[key as keyof typeof dataForApi] && delete dataForApi[key as keyof typeof dataForApi]);

            const { html, css } = await generateBlogPostWithCssFromData(dataForApi);
            setGeneratedPosts([{ title: singleProduct.Produto, html, css }]);
        } catch (error) {
            setGeneratedPosts([{ title: singleProduct.Produto, html: '', css: '', error: 'Falha ao gerar este post.' }]);
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePublish = async (index: number, post: GeneratedPost) => {
        setPublishStates(prev => ({ ...prev, [index]: { status: 'loading' } }));

        const result = await publishToWordPress(
            settings,
            post.title,
            post.html,
            post.css
        );

        if (result.success) {
            setPublishStates(prev => ({ ...prev, [index]: { status: 'success', message: 'Post publicado!', link: result.postLink } }));
        } else {
            setPublishStates(prev => ({ ...prev, [index]: { status: 'error', message: result.message } }));
        }
    };

    const totalPages = csvData ? Math.ceil(csvData.rows.length / ROWS_PER_PAGE) : 0;

    const renderContent = () => {
        if (!csvData) {
            return (
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="relative block w-full rounded-2xl border-2 border-dashed border-slate-700/50 bg-slate-800/20 p-12 text-center hover:border-brand-primary hover:bg-slate-800/40 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-dark-bg transition-all duration-300 group"
                >
                    <div className="bg-slate-800/50 rounded-full p-4 w-20 h-20 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                        <UploadIcon className="h-10 w-10 text-brand-primary/80" />
                    </div>
                    <span className="mt-4 block text-lg font-semibold text-dark-text-primary">
                        Arraste e solte um arquivo CSV
                    </span>
                    <span className="mt-2 block text-sm text-dark-text-secondary">para geração em massa de conteúdo</span>
                    <label htmlFor="file-upload" className="mt-6 inline-block cursor-pointer bg-brand-primary/10 text-brand-primary font-bold py-2 px-6 rounded-full hover:bg-brand-primary/20 transition-colors">
                        Selecionar Arquivo
                    </label>
                    <input id="file-upload" name="file-upload" type="file" accept=".csv" className="sr-only" onChange={handleFileChange} />
                </div>
            );
        }

        if (!isMappingComplete) {
            return (
                <div className="bg-dark-card/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-black/10 border border-dark-border/50 p-6 lg:p-8 animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-dark-text-primary">Mapeamento de Colunas</h2>
                    </div>
                    <p className="text-base text-dark-text-secondary mb-8 bg-slate-800/30 p-4 rounded-xl border border-slate-700/30">
                        Associe as colunas do seu arquivo .csv aos campos de produto necessários para a geração do post.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <MappingField name="Produto" label="Nome do Produto" required headers={csvData.headers} value={columnMapping.Produto} onChange={handleMappingChange} />
                        <MappingField name="Imagem" label="URL da Imagem" headers={csvData.headers} value={columnMapping.Imagem} onChange={handleMappingChange} />
                        <MappingField name="Preco" label="Preço" headers={csvData.headers} value={columnMapping.Preco} onChange={handleMappingChange} />
                        <MappingField name="Avaliacao" label="Avaliação" headers={csvData.headers} value={columnMapping.Avaliacao} onChange={handleMappingChange} />
                    </div>

                    <div className="pt-6 border-t border-dark-border/50 flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4">
                        <button
                            onClick={resetCsvState}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-800 text-dark-text-secondary font-bold py-3 px-6 rounded-xl hover:bg-slate-700 transition-all hover:-translate-x-1"
                        >
                            <ChevronLeftIcon className="h-5 w-5" />
                            Voltar
                        </button>
                        <button
                            onClick={handleConfirmMapping}
                            disabled={!columnMapping.Produto}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 hover:-translate-y-0.5"
                        >
                            Confirmar Mapeamento
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-dark-card/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-black/10 border border-dark-border/50 p-6 lg:p-8 animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <div className='flex items-center gap-3'>
                        <div className="p-2 bg-brand-secondary/10 rounded-lg">
                            <FileTextIcon className="h-6 w-6 text-brand-secondary" />
                        </div>
                        <h2 className="text-xl font-bold text-dark-text-primary">{fileName}</h2>
                    </div>
                    <button
                        onClick={resetCsvState}
                        className="text-sm text-red-400 hover:text-red-300 font-semibold hover:underline decoration-red-400/30 underline-offset-4 transition-all"
                    >
                        Remover arquivo
                    </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-dark-border/50">
                    <table className="w-full text-sm text-left text-dark-text-secondary">
                        <thead className="text-xs text-dark-text-primary uppercase bg-slate-800/80">
                            <tr>
                                <th scope="col" className="p-4">
                                    <input type="checkbox" className="w-5 h-5 text-brand-primary bg-slate-900 border-slate-600 rounded focus:ring-brand-primary focus:ring-offset-0 cursor-pointer"
                                        onChange={handleSelectAllOnPage}
                                        checked={currentTableData.length > 0 && currentTableData.every((_, i) => selectedRows.has((currentPage - 1) * ROWS_PER_PAGE + i))}
                                    />
                                </th>
                                {csvData.headers.map(header => <th key={header} scope="col" className="px-6 py-4 font-bold tracking-wider">{header}</th>)}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border/30">
                            {currentTableData.map((row, index) => {
                                const globalIndex = (currentPage - 1) * ROWS_PER_PAGE + index;
                                const isSelected = selectedRows.has(globalIndex);
                                return (
                                    <tr key={globalIndex} className={`hover:bg-slate-800/30 transition-colors ${isSelected ? 'bg-brand-primary/5' : ''}`}>
                                        <td className="w-4 p-4">
                                            <input type="checkbox" className="w-5 h-5 text-brand-primary bg-slate-900 border-slate-600 rounded focus:ring-brand-primary focus:ring-offset-0 cursor-pointer"
                                                checked={isSelected}
                                                onChange={() => handleRowSelection(globalIndex)}
                                            />
                                        </td>
                                        {csvData.headers.map(header => <td key={header} className="px-6 py-4 truncate max-w-xs font-medium">{row[header]}</td>)}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between mt-6">
                    <span className="text-sm font-medium text-dark-text-secondary bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
                        {selectedRows.size} de {csvData.rows.length} selecionados
                    </span>
                    <nav aria-label="Pagination">
                        <ul className="inline-flex items-center -space-x-px text-sm shadow-sm">
                            <li>
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="flex items-center justify-center h-10 px-4 font-medium text-dark-text-secondary bg-dark-card border border-dark-border rounded-l-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeftIcon className="h-5 w-5" />
                                </button>
                            </li>
                            <li>
                                <span
                                    aria-current="page"
                                    className="flex items-center justify-center h-10 px-4 text-xs font-bold text-dark-text-primary bg-slate-800 border-y border-dark-border"
                                >
                                    Página {currentPage} de {totalPages}
                                </span>
                            </li>
                            <li>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center justify-center h-10 px-4 font-medium text-dark-text-secondary bg-dark-card border border-dark-border rounded-r-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRightIcon className="h-5 w-5" />
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>

                <div className="mt-8 border-t border-dark-border/50 pt-6">
                    <button
                        onClick={handleGeneratePosts}
                        disabled={selectedRows.size === 0}
                        className="w-full md:w-auto flex items-center justify-center gap-3 bg-brand-primary text-white font-bold py-4 px-8 rounded-xl hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 hover:-translate-y-0.5"
                    >
                        <MagicWandIcon className="h-6 w-6" />
                        <span className="text-lg">Gerar Postagens com IA ({selectedRows.size})</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="mb-12 text-center max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary mb-4 tracking-tight">
                    Postagens Inteligentes
                </h1>
                <p className="text-lg text-dark-text-secondary leading-relaxed">
                    Importe produtos em massa ou crie posts individuais com o poder da IA.
                    <br className="hidden md:block" />
                    Otimizado para conversão e engajamento.
                </p>
            </div>

            <div className="bg-dark-card/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-black/10 border border-dark-border/50 p-6 lg:p-8 mb-8 animate-fade-in">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-brand-secondary/10 rounded-lg">
                        <MagicWandIcon className="h-6 w-6 text-brand-secondary" />
                    </div>
                    <h2 className="text-2xl font-bold text-dark-text-primary">Gerar Postagem Individual</h2>
                </div>
                <p className="text-base text-dark-text-secondary mb-8 ml-1">Preencha os detalhes do produto para criar um post rapidamente.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="text" name="Produto" value={singleProduct.Produto} onChange={handleSingleProductChange} placeholder="Nome do Produto *" className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-dark-text-primary placeholder-slate-500 focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50 transition-all" />
                    <input type="text" name="Imagem" value={singleProduct.Imagem} onChange={handleSingleProductChange} placeholder="URL da Imagem do Produto" className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-dark-text-primary placeholder-slate-500 focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50 transition-all" />
                    <input type="text" name="Preco" value={singleProduct.Preco} onChange={handleSingleProductChange} placeholder="Preço (ex: R$ 39,90)" className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-dark-text-primary placeholder-slate-500 focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50 transition-all" />
                    <input type="text" name="Avaliacao" value={singleProduct.Avaliacao} onChange={handleSingleProductChange} placeholder="Avaliação (ex: 4.9)" className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-dark-text-primary placeholder-slate-500 focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50 transition-all" />
                </div>
                <div className="mt-8">
                    <button
                        onClick={handleGenerateSinglePost}
                        disabled={!singleProduct.Produto}
                        className="w-full md:w-auto flex items-center justify-center gap-3 bg-brand-secondary text-white font-bold py-4 px-8 rounded-xl hover:bg-brand-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-brand-secondary/20 hover:shadow-brand-secondary/40 hover:-translate-y-0.5"
                    >
                        <MagicWandIcon className="h-6 w-6" />
                        <span className="text-lg">Gerar Postagem Única com IA</span>
                    </button>
                </div>
            </div>

            <div className="bg-dark-card/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-black/10 border border-dark-border/50 p-6 lg:p-8 mb-8 animate-fade-in">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-brand-secondary/10 rounded-lg">
                        <CameraIcon className="h-6 w-6 text-brand-secondary" />
                    </div>
                    <h2 className="text-2xl font-bold text-dark-text-primary">Vídeos Virais para Conteúdo</h2>
                </div>
                <p className="text-base text-dark-text-secondary mb-8 ml-1">
                    Utilize vídeos sem direitos autorais para criar conteúdo viral e aumentar o engajamento de suas publicações.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <a
                        href="https://web.telegram.org/k/#@videosviraisgratuito"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-4 bg-slate-800/50 p-6 rounded-xl border border-dark-border/50 hover:border-brand-primary/50 hover:bg-slate-800/80 transition-all group"
                    >
                        <div>
                            <h3 className="font-bold text-lg text-dark-text-primary group-hover:text-brand-primary transition-colors">Canal de Vídeos Virais</h3>
                            <p className="text-sm text-dark-text-secondary mt-1">Encontre vídeos em alta para suas campanhas</p>
                        </div>
                        <div className="bg-slate-700/50 p-3 rounded-full group-hover:bg-brand-primary/20 transition-colors">
                            <TelegramIcon className="h-6 w-6 text-dark-text-secondary group-hover:text-brand-primary" />
                        </div>
                    </a>
                    <a
                        href="https://s.shopee.com.br/6VFVPvCRW5"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-4 bg-slate-800/50 p-6 rounded-xl border border-dark-border/50 hover:border-brand-primary/50 hover:bg-slate-800/80 transition-all group"
                    >
                        <div>
                            <h3 className="font-bold text-lg text-dark-text-primary group-hover:text-brand-primary transition-colors">Produto Sugerido</h3>
                            <p className="text-sm text-dark-text-secondary mt-1">Mini Câmera A9 Wi-fi - Alta conversão</p>
                        </div>
                        <div className="bg-slate-700/50 p-3 rounded-full group-hover:bg-brand-primary/20 transition-colors">
                            <ShopeeIcon className="h-6 w-6 text-dark-text-secondary group-hover:text-brand-primary" />
                        </div>
                    </a>
                </div>
            </div>

            {renderContent()}

            {error && (
                <div className="mt-6 bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg flex items-center gap-3">
                    <AlertTriangleIcon />
                    <p>{error}</p>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-fade-in">
                    <div className="bg-dark-card rounded-xl shadow-2xl border border-dark-border w-full max-w-3xl relative animate-scale-in flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-dark-border flex justify-between items-center">
                            <h2 className="text-xl font-bold text-dark-text-primary flex items-center gap-2">
                                {isGenerating && <LoaderIcon />}
                                {isGenerating ? `Gerando Postagens... (${generatedPosts.length}/${selectedRows.size || 1})` : `Postagens Geradas (${generatedPosts.length})`}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-dark-text-secondary hover:text-dark-text-primary transition-colors">
                                <XIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-6">
                            {generatedPosts.map((post, index) => {
                                const publishState = publishStates[index] || { status: 'idle' };
                                return (
                                    <BlogPostPreview
                                        key={index}
                                        post={post}
                                        onPublish={() => handlePublish(index, post)}
                                        publishState={publishState}
                                        isWpConfigured={isWpConfigured}
                                        onNavigate={onNavigate}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};