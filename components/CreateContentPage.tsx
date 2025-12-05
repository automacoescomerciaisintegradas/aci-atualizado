
import React, { useState, useEffect } from "react";
import {
    SparklesIcon,
    FileTextIcon,
    SendIcon,
    RefreshCwIcon,
    GlobeIcon,
    EyeIcon
} from "../components/Icons"; // Assuming Icons are available here

// Mock UI components (reuse from BlogsPage or extract to shared file later)
const Button = ({ children, onClick, variant = "primary", className = "", disabled = false, type = "button" }: any) => {
    const baseStyle = "px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2";
    const variants: any = {
        primary: "bg-brand-primary text-white hover:bg-brand-secondary disabled:opacity-50",
        outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50",
        ghost: "text-gray-600 hover:bg-gray-100 disabled:opacity-50",
        destructive: "bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
    };
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`}
        >
            {children}
        </button>
    );
};

const Input = ({ value, onChange, placeholder, type = "text", required = false, className = "", min, max, step }: any) => (
    <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        step={step}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary ${className}`}
    />
);

const Card = ({ children, className = "" }: any) => (
    <div className={`bg-white dark:bg-dark-card rounded-lg shadow-md border border-gray-200 dark:border-dark-border overflow-hidden ${className}`}>
        {children}
    </div>
);

const CardHeader = ({ children }: any) => <div className="p-4 border-b border-gray-200 dark:border-dark-border">{children}</div>;
const CardTitle = ({ children, className = "" }: any) => <h3 className={`text-lg font-semibold text-gray-900 dark:text-gray-100 ${className}`}>{children}</h3>;
const CardDescription = ({ children }: any) => <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{children}</p>;
const CardContent = ({ children, className = "" }: any) => <div className={`p-4 ${className}`}>{children}</div>;

interface Blog {
    id: string
    name: string
    url: string
    status: string
}

export const CreateContentPage = () => {
    const [topic, setTopic] = useState("")
    const [keywords, setKeywords] = useState("")
    const [wordCount, setWordCount] = useState(1000)
    const [tone, setTone] = useState("profissional")
    const [model, setModel] = useState("gpt-4-turbo")

    const [generating, setGenerating] = useState(false)
    const [generatedContent, setGeneratedContent] = useState<any>(null)
    const [error, setError] = useState("")

    // Estado de publicação
    const [publishing, setPublishing] = useState(false)
    const [blogs, setBlogs] = useState<Blog[]>([])
    const [selectedBlog, setSelectedBlog] = useState("")
    const [postStatus, setPostStatus] = useState<"draft" | "publish">("draft")
    const [showPublishModal, setShowPublishModal] = useState(false)

    useEffect(() => {
        fetchBlogs()
    }, [])

    const fetchBlogs = async () => {
        try {
            const res = await fetch("/api/blogs")
            const data = await res.json()
            if (res.ok) {
                setBlogs(data.blogs.filter((b: Blog) => b.status === "connected" || b.status === "pending")) // Show pending too for dev
            }
        } catch (error) {
            console.error("Erro ao buscar blogs:", error)
        }
    }

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setGenerating(true)
        setGeneratedContent(null)

        try {
            const res = await fetch("/api/content/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "article",
                    topic,
                    keywords: keywords.split(",").map(k => k.trim()).filter(k => k),
                    wordCount,
                    tone,
                    model,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Erro ao gerar conteúdo")
            }

            setGeneratedContent(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setGenerating(false)
        }
    }

    const handlePublish = async () => {
        if (!selectedBlog || !generatedContent) return

        setPublishing(true)

        try {
            const res = await fetch(`/api/blogs/${selectedBlog}/publish`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: generatedContent.title || topic,
                    content: generatedContent.content,
                    status: postStatus,
                    contentId: generatedContent.id,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error)
            }

            alert(`✅ Post ${postStatus === 'draft' ? 'salvo como rascunho' : 'publicado'} com sucesso!\n\nURL: ${data.postUrl}`)
            setShowPublishModal(false)
        } catch (err: any) {
            alert(`❌ Erro: ${err.message}`)
        } finally {
            setPublishing(false)
        }
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gerar Artigo com IA</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Crie artigos otimizados para SEO/AEO com inteligência artificial
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Formulário */}
                <Card>
                    <CardHeader>
                        <CardTitle>Configurar Artigo</CardTitle>
                        <CardDescription>
                            Preencha as informações para gerar seu conteúdo
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleGenerate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                    Tema/Tópico <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="Ex: Como aumentar vendas no e-commerce"
                                    value={topic}
                                    onChange={(e: any) => setTopic(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                    Palavras-chave (separadas por vírgula)
                                </label>
                                <Input
                                    placeholder="Ex: vendas, e-commerce, marketing digital"
                                    value={keywords}
                                    onChange={(e: any) => setKeywords(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                    Quantidade de Palavras
                                </label>
                                <Input
                                    type="number"
                                    min="300"
                                    max="3000"
                                    step="100"
                                    value={wordCount}
                                    onChange={(e: any) => setWordCount(parseInt(e.target.value))}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Custo estimado: R$ {(wordCount * 0.00089).toFixed(2)}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                    Tom de Voz
                                </label>
                                <select
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value)}
                                >
                                    <option value="profissional">Profissional</option>
                                    <option value="casual">Casual</option>
                                    <option value="técnico">Técnico</option>
                                    <option value="persuasivo">Persuasivo</option>
                                    <option value="educativo">Educativo</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                    Modelo de IA
                                </label>
                                <select
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                >
                                    <option value="gpt-4-turbo">GPT-4 Turbo (Recomendado)</option>
                                    <option value="gpt-4">GPT-4</option>
                                </select>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={generating}
                            >
                                {generating ? (
                                    <>
                                        <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                                        Gerando conteúdo...
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="h-4 w-4 mr-2" />
                                        Gerar Artigo
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Preview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Preview</CardTitle>
                        <CardDescription>
                            Visualização do conteúdo gerado
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!generatedContent ? (
                            <div className="text-center py-12 text-gray-500">
                                <FileTextIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                <p>Seu conteúdo aparecerá aqui após ser gerado</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2 text-xl">
                                        {generatedContent.title || topic}
                                    </h3>
                                    <div
                                        className="prose prose-sm max-w-none dark:prose-invert p-4 bg-gray-50 dark:bg-slate-800 rounded-md border border-gray-200 dark:border-dark-border max-h-[400px] overflow-y-auto"
                                        dangerouslySetInnerHTML={{
                                            __html: generatedContent.content
                                        }}
                                    />
                                </div>

                                <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg text-sm border border-gray-200 dark:border-dark-border">
                                    <p className="text-gray-600 dark:text-gray-300">
                                        <strong>Palavras:</strong> {generatedContent.wordCount}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        <strong>Custo:</strong> R$ {generatedContent.cost?.toFixed(2)}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                            const blob = new Blob([generatedContent.content], {
                                                type: "text/html",
                                            })
                                            const url = URL.createObjectURL(blob)
                                            const a = document.createElement("a")
                                            a.href = url
                                            a.download = `${topic.substring(0, 30)}.html`
                                            a.click()
                                        }}
                                    >
                                        <FileTextIcon className="h-4 w-4 mr-2" />
                                        Baixar HTML
                                    </Button>

                                    {blogs.length > 0 && (
                                        <Button
                                            className="flex-1"
                                            onClick={() => setShowPublishModal(true)}
                                        >
                                            <SendIcon className="h-4 w-4 mr-2" />
                                            Publicar no WordPress
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Modal de Publicação */}
            {showPublishModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md shadow-2xl animate-scale-in">
                        <CardHeader>
                            <CardTitle>Publicar no WordPress</CardTitle>
                            <CardDescription>
                                Escolha o blog e o status da publicação
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                        Selecionar Blog
                                    </label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                        value={selectedBlog}
                                        onChange={(e) => setSelectedBlog(e.target.value)}
                                    >
                                        <option value="">Escolha um blog...</option>
                                        {blogs.map((blog) => (
                                            <option key={blog.id} value={blog.id}>
                                                {blog.name} ({blog.url})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                        Status da Publicação
                                    </label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                        value={postStatus}
                                        onChange={(e) => setPostStatus(e.target.value as any)}
                                    >
                                        <option value="draft">Rascunho</option>
                                        <option value="publish">Publicado</option>
                                    </select>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm">
                                    <p className="text-blue-800 font-medium">
                                        💰 Custo: R$ 0,09
                                    </p>
                                    <p className="text-blue-600 text-xs mt-1">
                                        Será debitado da sua carteira após confirmação
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setShowPublishModal(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        className="flex-1"
                                        onClick={handlePublish}
                                        disabled={publishing || !selectedBlog}
                                    >
                                        {publishing ? (
                                            <>
                                                <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                                                Publicando...
                                            </>
                                        ) : (
                                            <>
                                                <SendIcon className="h-4 w-4 mr-2" />
                                                Confirmar
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
