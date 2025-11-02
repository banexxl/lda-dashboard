import React, { forwardRef, useImperativeHandle, useEffect, useRef } from 'react'
import 'quill/dist/quill.snow.css'
import Box from '@mui/material/Box'

interface QuillEditorProps {
     placeholder?: string
     onChange?: (value: string) => void
     onBlur?: (value?: string) => void
     value?: string
     initialValue?: string
     commitMode?: 'onChange' | 'onBlur'
}

export interface QuillEditorRef {
     getEditor: () => any
     getContents: () => string
}

const QuillEditor = forwardRef<QuillEditorRef, QuillEditorProps>(
     ({ placeholder, onChange, onBlur, value, initialValue, commitMode = 'onChange' }, ref) => {
          const containerRef = useRef<HTMLDivElement | null>(null)
          const quillRef = useRef<any>(null) // will hold the Quill instance once loaded

          // keep latest handlers without re-subscribing
          const currentValueRef = useRef<string | undefined>(value)
          const onChangeRef = useRef<typeof onChange>(onChange)
          const onBlurRef = useRef<typeof onBlur>(onBlur)
          useEffect(() => { onChangeRef.current = onChange }, [onChange])
          useEffect(() => { onBlurRef.current = onBlur }, [onBlur])

          useImperativeHandle(ref, () => ({
               getEditor: () => quillRef.current,
               getContents: () => (quillRef.current?.root?.innerHTML ?? '')
          }))

          // Initialize Quill only on the client
          useEffect(() => {
               let quillInstance: any | null = null
               let handleTextChange: (() => void) | null = null
               let handleBlur: (() => void) | null = null
               let destroyed = false

               const init = async () => {
                    if (typeof window === 'undefined') return
                    if (!containerRef.current) return

                    const Quill = (await import('quill')).default

                    // Register font & size whitelists (client-only)
                    const Font: any = Quill.import('attributors/style/font')
                    Font.whitelist = [
                         'Inter',
                         'Arial',
                         'Times New Roman',
                         'Georgia',
                         'Courier New',
                         'Monospace',
                         'Sans Serif',
                         'Serif'
                    ]
                    Quill.register(Font, true)

                    const Size: any = Quill.import('attributors/style/size')
                    Size.whitelist = ['12px', '14px', '16px', '18px', '24px', '32px']
                    Quill.register(Size, true)

                    // Create the editor
                    quillInstance = new Quill(containerRef.current, {
                         theme: 'snow',
                         placeholder: placeholder || 'Start typing...',
                         modules: {
                              toolbar: [
                                   [{ font: [] }, { size: [] }],
                                   ['bold', 'italic', 'underline', 'strike'],
                                   [{ list: 'ordered' }, { list: 'bullet' }],
                                   ['link'],
                                   ['clean']
                              ]
                         }
                    })
                    quillRef.current = quillInstance
                    if (destroyed) return

                    // Set initial HTML (value has priority over initialValue)
                    const startHTML = (typeof value === 'string' ? value : initialValue) || ''
                    if (quillInstance.root.innerHTML !== startHTML) {
                         quillInstance.root.innerHTML = startHTML
                    }
                    currentValueRef.current = startHTML

                    // Handlers
                    handleTextChange = () => {
                         if (!quillInstance) return
                         const html = quillInstance.root.innerHTML
                         if (html !== currentValueRef.current) {
                              currentValueRef.current = html
                              if (commitMode === 'onChange') {
                                   onChangeRef.current && onChangeRef.current(html)
                              }
                         }
                    }

                    handleBlur = () => {
                         const html = quillInstance?.root?.innerHTML
                         onBlurRef.current && onBlurRef.current(html)
                    }

                    quillInstance.on('text-change', handleTextChange)
                    quillInstance.root.addEventListener('blur', handleBlur as EventListener)
               }

               init()

               return () => {
                    destroyed = true
                    if (quillInstance && handleTextChange) {
                         quillInstance.off('text-change', handleTextChange)
                    }
                    if (quillInstance && handleBlur) {
                         quillInstance.root.removeEventListener('blur', handleBlur as EventListener)
                    }
                    quillRef.current = null
               }
               // eslint-disable-next-line react-hooks/exhaustive-deps
          }, [placeholder, commitMode])

          // Sync external value (controlled mode)
          useEffect(() => {
               const quill = quillRef.current
               if (!quill) return
               if (typeof value === 'string' && value !== currentValueRef.current) {
                    if (quill.root.innerHTML !== value) {
                         quill.root.innerHTML = value
                    }
                    currentValueRef.current = value
               }
          }, [value])

          return (
               <Box
                    sx={(theme) => ({
                         border: '1px solid',
                         borderColor: 'divider',
                         borderRadius: 2,
                         display: 'flex',
                         flexDirection: 'column',
                         '& .ql-toolbar.ql-snow': {
                              border: '1px solid',
                              borderBottom: `1px solid ${theme.palette.divider}`,
                              borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
                              backgroundColor: theme.palette.background.paper
                         },
                         '& .ql-container.ql-snow': {
                              border: '1px solid',
                              flexGrow: 1,
                              display: 'flex',
                              flexDirection: 'column'
                         },
                         '& .ql-editor': {
                              fontFamily: theme.typography.fontFamily,
                              fontSize: theme.typography.body1.fontSize,
                              color: theme.palette.text.primary,
                              minHeight:
                                   typeof theme.typography.body1.lineHeight === 'number'
                                        ? `${theme.typography.body1.lineHeight * 7}em`
                                        : '10.5em',
                              paddingBottom: theme.spacing(2),
                              '&.ql-blank::before': {
                                   color: theme.palette.text.secondary,
                                   fontStyle: 'normal'
                              }
                         }
                    })}
               >
                    {/* This div becomes the Quill root */}
                    <div ref={containerRef} />
               </Box>
          )
     }
)

QuillEditor.displayName = 'QuillEditor'
export default QuillEditor
