"use client"

import { BaseSyntheticEvent, PropsWithChildren } from "react"
import { useEffect } from "react"

const Modal = ({ visible, onClose, children }: { visible: Boolean, onClose: Function, children: PropsWithChildren["children"]}) => {
    
    const keyDownHandler = (e: KeyboardEvent) => {
        if (e.code !== "Escape") return
        document.removeEventListener("keydown", keyDownHandler)
        onClose()
    }
    
    useEffect(() => {
        if (visible) document.addEventListener("keydown", keyDownHandler)
        return () => {
            document.removeEventListener("keydown", keyDownHandler)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible])
        
    if (!visible) return
        
    const handleClose = (e: BaseSyntheticEvent) => {
        if (e.target.id !== "wrapper") return
        document.removeEventListener("keydown", keyDownHandler)
        onClose()
    }

    return <div style={{position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.3)", zIndex: 1, color: "rgb(248, 250, 252)", fontSize: "18px", display: "flex", justifyContent: "center", alignItems: "center"}} id="wrapper" onClick={handleClose}>
        <div style={{background: "rgb(55, 65, 81)", display: "flex", flexDirection: "column", justifyContent: "center", padding: 28, borderRadius: 12}}>
            {children}
        </div>
    </div>
}

export default Modal
