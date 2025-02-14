import { useEffect, useState } from "react"

interface Socket {
    socket : WebSocket | null,
    loading : boolean
}

export const useSocket = (): Socket =>{
    const [socket, setSocket] = useState<WebSocket | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(()=>{
        setLoading(true)
        const newSocket = new WebSocket("ws://localhost:8080")
        newSocket.onopen = ()=>{
            setSocket(newSocket)
            setLoading(false)
        }
    },[])

    return {
        socket, loading
    }
}