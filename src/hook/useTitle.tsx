import { useEffect } from 'react'

/**
 * Hook for changing title
 * https://stackoverflow.com/a/55415722/6620659
 */
export const useTitle = (title: string) => {
    useEffect(() => {
        const oldTitle = document.title
        if (title)
            document.title = title.trim() + " - VimeWorld"
        // following line is optional, but will reset title when component unmounts
        return () => { document.title = oldTitle }
    }, [title])
}
