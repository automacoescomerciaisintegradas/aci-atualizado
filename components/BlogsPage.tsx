
import React, { useState, useEffect } from "react";
import {
    PlusIcon,
    GlobeIcon,
    TrashIcon,
    EditIcon,
    CheckCircleIcon,
    XCircleIcon,
    RefreshCwIcon,
    ExternalLinkIcon
} from "../components/Icons"; // Assuming Icons are available here or need to be added

// Mock UI components to replace Shadcn/UI if not available
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

const Input = ({ value, onChange, placeholder, type = "text", required = false, className = "" }: any) => (
    <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
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
    username: string
    status: string
    lastSync: string | null
    createdAt: string
}

export const BlogsPage = () => {
    const [blogs, setBlogs] = useState<Blog[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [testingBlog, setTestingBlog] = useState<string | null>(null)

    // Formulário de novo blog
    const [formData, setFormData] = useState({
        name: "",
        url: "",
        username: "",
        password: "",
    })

    const [formError, setFormError] = useState("")
    const [formLoading, setFormLoading] = useState(false)

    useEffect(() => {
        fetchBlogs()
    }, [])

    const fetchBlogs = async () => {
        try {
            const res = await fetch("/api/blogs")
            const data = await res.json()
            if (res.ok) {
                // Validate each blog's connection status
                const blogsData = data.blogs;
                const updatedBlogs = await Promise.all(blogsData.map(async (blog: any) => {
                    try {
                        const validationRes = await fetch("/api/wordpress/validate", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                wordpressUrl: blog.url,
                                wordpressUsername: blog.username,
                                wordpressAppPassword: "", // We don't have the password in the blog list for security reasons
                            }),
                        });
                        
                        const validationData = await validationRes.json();
                        return {
                            ...blog,
                            status: validationData.success ? "connected" : "error"
                        };
                    } catch (error) {
                        return {
                            ...blog,
                            status: "error"
                        };
                    }
                }));
                
                setBlogs(updatedBlogs);
            }
        } catch (error) {
            console.error("Erro ao buscar blogs:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddBlog = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError("")
        setFormLoading(true)

        try {
            // First validate the WordPress credentials
            const validationRes = await fetch("/api/wordpress/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    wordpressUrl: formData.url,
                    wordpressUsername: formData.username,
                    wordpressAppPassword: formData.password,
                }),
            })

            const validationData = await validationRes.json()

            if (!validationRes.ok || !validationData.success) {
                throw new Error(validationData.message || "Falha na validação das credenciais")
            }

            // If validation is successful, add the blog
            const res = await fetch("/api/blogs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error)
            }

            // Sucesso
            setShowAddModal(false)
            setFormData({ name: "", url: "", username: "", password: "" })
            fetchBlogs()
        } catch (error: any) {
            setFormError(error.message)
        } finally {
            setFormLoading(false)
        }
    }

    const handleDeleteBlog = async (blogId: string) => {
        if (!confirm("Tem certeza que deseja remover este blog?")) return

        try {
            const res = await fetch(`/api/blogs?id=${blogId}`, {
                method: "DELETE",
            })

            if (res.ok) {
                fetchBlogs()
            }
        } catch (error) {
            console.error("Erro ao deletar blog:", error)
        }
    }

    const handleTestConnection = async (blogId: string) => {
        setTestingBlog(blogId)

        try {
            // Get the blog details from state
            const blog = blogs.find(b => b.id === blogId);
            if (!blog) {
                alert("Blog não encontrado");
                return;
            }

            // Validate the WordPress credentials
            const validationRes = await fetch("/api/wordpress/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    wordpressUrl: blog.url,
                    wordpressUsername: blog.username,
                    wordpressAppPassword: "", // We don't have the password in the blog list for security reasons
                }),
            })

            const validationData = await validationRes.json()

            if (validationData.success) {
                alert(`✅ ${validationData.message}\n\nSite: ${blog.name}`)
                fetchBlogs()
            } else {
                alert(`❌ ${validationData.message}`)
            }
        } catch (error) {
            alert("Erro ao testar conexão")
        } finally {
            setTestingBlog(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <RefreshCwIcon className="h-8 w-8 animate-spin mx-auto mb-4 text-brand-primary" />
                    <p className="text-gray-500">Carregando blogs...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meus Blogs WordPress</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Gerencie seus blogs e publique conteúdo automaticamente
                    </p>
                </div>
                <Button onClick={() => setShowAddModal(true)}>
                    <PlusIcon className="h-4 w-4" />
                    Adicionar Blog
                </Button>
            </div>

            {/* Lista de Blogs */}
            {blogs.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <GlobeIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Nenhum blog conectado
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Adicione seu primeiro blog WordPress para começar a publicar
                        </p>
                        <Button onClick={() => setShowAddModal(true)}>
                            <PlusIcon className="h-4 w-4" />
                            Adicionar Primeiro Blog
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {blogs.map((blog) => (
                        <Card key={blog.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CardTitle className="truncate" title={blog.name}>{blog.name}</CardTitle>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            {blog.status === "connected" ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                                    <CheckCircleIcon className="h-3 w-3" />
                                                    Conectado
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                                                    <XCircleIcon className="h-3 w-3" />
                                                    Erro
                                                </span>
                                            )}
                                        </div>
                                        <CardDescription className="flex items-center gap-1 truncate">
                                            <GlobeIcon className="h-3 w-3 flex-shrink-0" />
                                            <a
                                                href={blog.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:underline truncate"
                                            >
                                                {blog.url}
                                            </a>
                                            <ExternalLinkIcon className="h-3 w-3 flex-shrink-0" />
                                        </CardDescription>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Button
                                            variant="ghost"
                                            className="p-2 h-8 w-8"
                                            onClick={() => handleTestConnection(blog.id)}
                                            disabled={testingBlog === blog.id}
                                            title="Testar Conexão"
                                        >
                                            <RefreshCwIcon
                                                className={`h-4 w-4 ${testingBlog === blog.id ? "animate-spin" : ""
                                                    }`}
                                            />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="p-2 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDeleteBlog(blog.id)}
                                            title="Remover Blog"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-dark-border">
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Usuário</p>
                                        <p className="font-medium text-gray-900 dark:text-gray-200 truncate" title={blog.username}>{blog.username}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Última sync</p>
                                        <p className="font-medium text-gray-900 dark:text-gray-200">
                                            {blog.lastSync
                                                ? new Date(blog.lastSync).toLocaleDateString("pt-BR")
                                                : "Nunca"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal Adicionar Blog */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg shadow-2xl animate-scale-in">
                        <CardHeader>
                            <CardTitle>Adicionar Blog WordPress</CardTitle>
                            <CardDescription>
                                Conecte seu blog para publicar conteúdo automaticamente
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddBlog} className="space-y-4">
                                {formError && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                                        {formError}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Nome do Blog
                                    </label>
                                    <Input
                                        placeholder="Meu Blog Pessoal"
                                        value={formData.name}
                                        onChange={(e: any) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        URL do Blog
                                    </label>
                                    <Input
                                        type="url"
                                        placeholder="https://meublog.com.br"
                                        value={formData.url}
                                        onChange={(e: any) =>
                                            setFormData({ ...formData, url: e.target.value })
                                        }
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        URL completa do seu blog WordPress
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Usuário
                                    </label>
                                    <Input
                                        placeholder="admin"
                                        value={formData.username}
                                        onChange={(e: any) =>
                                            setFormData({ ...formData, username: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Senha de Aplicativo
                                    </label>
                                    <Input
                                        type="password"
                                        placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                                        value={formData.password}
                                        onChange={(e: any) =>
                                            setFormData({ ...formData, password: e.target.value })
                                        }
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Crie uma senha de aplicativo no WordPress em: Usuários →
                                        Perfil → Senhas de Aplicativos
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                            setShowAddModal(false)
                                            setFormError("")
                                            setFormData({ name: "", url: "", username: "", password: "" })
                                        }}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        disabled={formLoading}
                                    >
                                        {formLoading ? (
                                            <>
                                                <RefreshCwIcon className="h-4 w-4 animate-spin" />
                                                Testando...
                                            </>
                                        ) : "Adicionar Blog"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}