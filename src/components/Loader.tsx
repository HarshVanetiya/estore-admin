interface LoaderProps {
    fullScreen?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export default function Loader({ fullScreen = false, size = 'lg' }: LoaderProps) {

    const sizeClasses = {
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-4',
        lg: 'w-16 h-16 border-4',
    };

    const Spinner = () => (
        <div
            className={`
        ${sizeClasses[size]} 
        rounded-full 
        animate-spin 
        border-ink-black 
        border-t-ash-grey 
      `}
        ></div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-dark-teal/90 z-50 backdrop-blur-sm">
                <Spinner />
                <p className="mt-4 text-beige font-bold tracking-widest animate-pulse">
                    LOADING
                </p>
            </div>
        );
    }

    return (
        <div className="flex justify-center p-2">
            <Spinner />
        </div>
    );
}