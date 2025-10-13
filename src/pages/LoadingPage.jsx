export default function LoadingPage() {
    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center gap-4">
            <div className="size-12 rounded-full border-2 border-green-500 border-b-transparent ease-in-out animate-spin"></div>
            <p className="text-center animate-pulse">Cargando...</p>
        </div>
    )
}