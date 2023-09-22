"use client"

import { BaseSyntheticEvent, PropsWithChildren } from "react"
import { useEffect } from "react"

const Modal = ({ visible, onClose, children }: { visible: Boolean, onClose: Function, children: PropsWithChildren["children"]}) => {
    if (!visible) return

    const keyDownHandler = (e: KeyboardEvent) => {
        if (e.code !== "Escape") return
        onClose()
        document.removeEventListener("keydown", keyDownHandler)
    }

    useEffect(() => {
        document.addEventListener("keydown", keyDownHandler)
        return () => {
          document.removeEventListener("keydown", keyDownHandler)
        }
      }, [])

    const handleClose = (e: BaseSyntheticEvent) => {
        if (e.target.id !== "wrapper") return
        onClose()
        document.removeEventListener("keydown", keyDownHandler)
    }

    return <div className="fixed inset-0 bg-black bg-opacity-30 text-slate-50 text-lg flex justify-center items-center" id="wrapper" onClick={handleClose}>
        <div className="bg-gray-700 flex flex-col justify-center p-6 rounded-xl">
            {children}
        </div>
    </div>
}

export default Modal
