import React, { forwardRef, useImperativeHandle, useEffect, useRef, useState } from 'react'
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

// Custom toolbar component that Quill will bind to
const CustomToolbar = forwardRef<HTMLDivElement, {}>((props, ref) => {
     return (
          <div ref={ref} className="ql-toolbar ql-snow" data-custom-toolbar>
               <span className="ql-formats">
                    <select className="ql-font">
                         <option value="Inter">Inter</option>
                         <option value="Arial">Arial</option>
                         <option value="Times New Roman">Times New Roman</option>
                         <option value="Georgia">Georgia</option>
                         <option value="Courier New">Courier New</option>
                         <option value="Monospace">Monospace</option>
                         <option value="Sans Serif">Sans Serif</option>
                         <option value="Serif">Serif</option>
                    </select>
                    <select className="ql-size">
                         <option value="12px">12px</option>
                         <option value="14px">14px</option>
                         <option value="16px">16px</option>
                         <option value="18px">18px</option>
                         <option value="24px">24px</option>
                         <option value="32px">32px</option>
                    </select>
               </span>
               <span className="ql-formats">
                    <button className="ql-bold" />
                    <button className="ql-italic" />
                    <button className="ql-underline" />
                    <button className="ql-strike" />
               </span>
               <span className="ql-formats">
                    <button className="ql-list" value="ordered" />
                    <button className="ql-list" value="bullet" />
               </span>
               <span className="ql-formats">
                    <button className="ql-link" />
                    <button className="ql-clean" />
               </span>
          </div>
     )
})
CustomToolbar.displayName = 'CustomToolbar'

const QuillEditor = forwardRef<QuillEditorRef, QuillEditorProps>(
     ({ placeholder, onChange, onBlur, value, initialValue, commitMode = 'onChange' }, ref) => {
          const containerRef = useRef<HTMLDivElement | null>(null)
          const quillRef = useRef<any>(null) // will hold the Quill instance once loaded
          const [toolbarNode, setToolbarNode] = useState<HTMLDivElement | null>(null)

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
          const commitModeRef = useRef(commitMode)
          useEffect(() => { commitModeRef.current = commitMode }, [commitMode])

          useEffect(() => {
               let quillInstance: any | null = null
               let handleTextChange: (() => void) | null = null
               let handleBlur: (() => void) | null = null
               let destroyed = false

               const init = async () => {
                    if (typeof window === 'undefined') return
                    if (!containerRef.current) return
                    if (!toolbarNode) return
                    // Guard against multiple initializations
                    if (quillRef.current) return
                    // If a previous Quill-generated toolbar exists (not our custom one), remove it proactively
                    const maybeToolbar = containerRef.current.previousElementSibling as HTMLElement | null
                    if (maybeToolbar && maybeToolbar.classList.contains('ql-toolbar') && !maybeToolbar.hasAttribute('data-custom-toolbar')) {
                         maybeToolbar.remove()
                    }

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
                              toolbar: {
                                   container: toolbarNode
                              }
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
                              if (commitModeRef.current === 'onChange') {
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
                    // Remove Quill-inserted toolbar (not our custom one) and clean container DOM/classes
                    const el = containerRef.current as HTMLElement | null
                    if (el) {
                         const prev = el.previousElementSibling as HTMLElement | null
                         if (prev && prev.classList.contains('ql-toolbar') && !prev.hasAttribute('data-custom-toolbar')) {
                              prev.remove()
                         }
                         el.classList.remove('ql-container', 'ql-snow')
                         el.innerHTML = ''
                    }
                    quillInstance = null
                    quillRef.current = null
               }
          }, [toolbarNode])

          // update placeholder dynamically if it changes
          useEffect(() => {
               const quill = quillRef.current
               if (!quill) return
               const attr = placeholder || 'Start typing...'
               if (quill.root) {
                    quill.root.setAttribute('data-placeholder', attr)
               }
          }, [placeholder])

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
                              backgroundColor: theme.palette.background.paper,
                              position: 'relative',
                              zIndex: 2,
                              whiteSpace: 'nowrap',
                              overflow: 'visible'
                         },
                         '& .ql-container.ql-snow': {
                              border: '1px solid',
                              position: 'relative',
                              zIndex: 1,
                              flexGrow: 1,
                              display: 'flex',
                              flexDirection: 'column'
                         },
                         '& .ql-toolbar.ql-snow + .ql-container.ql-snow': {
                              borderTop: 0
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
                    <CustomToolbar ref={setToolbarNode} />
                    {/* This div becomes the Quill root */}
                    <div ref={containerRef} />
               </Box>
          )
     }
)

QuillEditor.displayName = 'QuillEditor'
export default QuillEditor
