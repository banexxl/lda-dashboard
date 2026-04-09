'use client';

import React, {
     forwardRef,
     useEffect,
     useImperativeHandle,
     useMemo,
     useRef,
     useState,
} from 'react';
import Box from '@mui/material/Box';
import 'quill/dist/quill.snow.css';
import Quill from 'quill';

export interface QuillEditorRef {
     getEditor: () => any | null;
     getContents: () => string;
}

type Props = {
     placeholder?: string;
     value?: string;                // controlled HTML
     initialValue?: string;         // initial HTML for uncontrolled
     onChange?: (html: string) => void;
     onBlur?: (html?: string) => void;
     commitMode?: 'onChange' | 'onBlur';
     heightEm?: number;             // editor min-height in "em"
     className?: string;
};

/** Custom toolbar DOM (native selects) */
const CustomToolbar = forwardRef<HTMLDivElement, { id: string }>((props, ref) => {
     return (
          <div
               ref={ref}
               id={props.id}
               className="ql-toolbar ql-snow"
               data-custom-toolbar
          >
               <span className="ql-formats">
                    <select className="ql-font" defaultValue="" title="Font (Ctrl/Cmd+Shift+F)">
                         <option value="">Default</option>
                         <option value="Inter">Inter</option>
                         <option value="Arial">Arial</option>
                         <option value="Times New Roman">Times New Roman</option>
                         <option value="Georgia">Georgia</option>
                         <option value="Courier New">Courier New</option>
                         <option value="Monospace">Monospace</option>
                         <option value="Sans Serif">Sans Serif</option>
                         <option value="Serif">Serif</option>
                    </select>

                    <select className="ql-size" defaultValue="" title="Size (Ctrl/Cmd+Shift+S)">
                         <option value="">Default</option>
                         <option value="12px">12px</option>
                         <option value="14px">14px</option>
                         <option value="16px">16px</option>
                         <option value="18px">18px</option>
                         <option value="24px">24px</option>
                         <option value="32px">32px</option>
                    </select>
               </span>

               <span className="ql-formats">
                    <button className="ql-bold" title="Bold (Ctrl/Cmd+B)" />
                    <button className="ql-italic" title="Italic (Ctrl/Cmd+I)" />
                    <button className="ql-underline" title="Underline (Ctrl/Cmd+U)" />
                    <button className="ql-strike" title="Strike (Ctrl/Cmd+Shift+X)" />
               </span>

               <span className="ql-formats">
                    <button className="ql-list" value="ordered" title="Numbered list (Ctrl/Cmd+Shift+7)" />
                    <button className="ql-list" value="bullet" title="Bulleted list (Ctrl/Cmd+Shift+8)" />
               </span>

               <span className="ql-formats">
                    <select className="ql-align" defaultValue="" title="Align (Ctrl/Cmd+Shift+L/E/R/J)">
                         <option value="" />
                         <option value="center" />
                         <option value="right" />
                         <option value="justify" />
                    </select>
               </span>

               <span className="ql-formats">
                    <button className="ql-link" title="Insert link (Ctrl/Cmd+K)" />
                    <button className="ql-clean" title="Clear formatting (Ctrl/Cmd+\\)" />
               </span>
          </div>
     );
});
CustomToolbar.displayName = 'CustomToolbar';

const QuillEditor = forwardRef<QuillEditorRef, Props>((props, ref) => {
     const {
          placeholder = 'Start typing…',
          value,
          initialValue,
          onChange,
          onBlur,
          commitMode = 'onChange',
          heightEm = 10.5,
          className,
     } = props;

     const containerRef = useRef<HTMLDivElement | null>(null);
     const quillRef = useRef<any | null>(null);
     const [toolbarNode, setToolbarNode] = useState<HTMLDivElement | null>(null);
     const toolbarId = useMemo(
          () => 'ql-toolbar-' + Math.random().toString(36).slice(2),
          []
     );

     // keep latest handlers/values
     const onChangeRef = useRef(onChange);
     const onBlurRef = useRef(onBlur);
     const commitModeRef = useRef(commitMode);
     const currentValueRef = useRef<string | undefined>(value);

     useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
     useEffect(() => { onBlurRef.current = onBlur; }, [onBlur]);
     useEffect(() => { commitModeRef.current = commitMode; }, [commitMode]);

     useImperativeHandle(ref, () => ({
          getEditor: () => quillRef.current,
          getContents: () => quillRef.current?.root?.innerHTML ?? '',
     }));

     useEffect(() => {
          let quillInstance: Quill | null = null;
          let handleTextChange: (() => void) | null = null;
          const savedRangeRef = { current: null as null | { index: number; length: number } };

          const init = async () => {
               if (typeof window === 'undefined') return;
               if (!containerRef.current || !toolbarNode) return;
               if (quillRef.current) return;

               const Quill = (await import('quill')).default;
               // Whitelists (style attributors)
               const Font: any = Quill.import('attributors/style/font');
               Font.whitelist = [
                    'Inter',
                    'Arial',
                    'Times New Roman',
                    'Georgia',
                    'Courier New',
                    'Monospace',
                    'Sans Serif',
                    'Serif',
               ];
               Quill.register(Font, true);

               const Size: any = Quill.import('attributors/style/size');
               Size.whitelist = ['12px', '14px', '16px', '18px', '20px', '22px', '24px', '32px'];
               Quill.register(Size, true);

               const Align: any = Quill.import('attributors/style/align');
               Align.whitelist = ['', 'center', 'right', 'justify'];
               Quill.register(Align, true);

               const fontWhitelist = Font.whitelist as string[];
               const sizeWhitelist = Size.whitelist as string[];

               const getNextValue = (list: string[], current: string | false | undefined) => {
                    if (!list.length) return '';
                    if (!current || current === '') return list[0];
                    const index = list.indexOf(current);
                    return list[(index + 1) % list.length];
               };

               // Remember selection when toolbar is interacted with
               const rememberSelection = () => {
                    const r = quillInstance?.getSelection();
                    if (r) savedRangeRef.current = r;
               };
               toolbarNode.addEventListener('mousedown', rememberSelection, true);

               quillInstance = new Quill(containerRef.current, {
                    theme: 'snow',
                    placeholder,
                    modules: {
                         toolbar: {
                              container: `#${toolbarId}`,
                              handlers: {
                                   size(this: any, value: string) {
                                        const r = savedRangeRef.current;
                                        if (r) this.quill.setSelection(r.index, r.length, 'user');
                                        if (value) this.quill.format('size', value, 'user');
                                        else this.quill.format('size', false, 'user');
                                   },
                                   font(this: any, value: string) {
                                        const r = savedRangeRef.current;
                                        if (r) this.quill.setSelection(r.index, r.length, 'user');
                                        if (value) this.quill.format('font', value, 'user');
                                        else this.quill.format('font', false, 'user');
                                   },
                              },
                         },
                         keyboard: {
                              bindings: {
                                   // Bold (Ctrl/Cmd+B)
                                   bold: {
                                        key: 'B',
                                        shortKey: true,
                                        handler(this: any) {
                                             this.quill.format('bold', !this.quill.getFormat().bold, 'user');
                                        },
                                   },
                                   // Italic (Ctrl/Cmd+I)
                                   italic: {
                                        key: 'I',
                                        shortKey: true,
                                        handler(this: any) {
                                             this.quill.format('italic', !this.quill.getFormat().italic, 'user');
                                        },
                                   },
                                   // Underline (Ctrl/Cmd+U)
                                   underline: {
                                        key: 'U',
                                        shortKey: true,
                                        handler(this: any) {
                                             this.quill.format('underline', !this.quill.getFormat().underline, 'user');
                                        },
                                   },
                                   // Strike (Ctrl/Cmd+Shift+X)
                                   strike: {
                                        key: 'X',
                                        shortKey: true,
                                        shiftKey: true,
                                        handler(this: any) {
                                             this.quill.format('strike', !this.quill.getFormat().strike, 'user');
                                        },
                                   },
                                   // Ordered list (Ctrl/Cmd+Shift+7)
                                   listOrdered: {
                                        key: '7',
                                        shortKey: true,
                                        shiftKey: true,
                                        handler(this: any) {
                                             const isOrdered = this.quill.getFormat().list === 'ordered';
                                             this.quill.format('list', isOrdered ? false : 'ordered', 'user');
                                        },
                                   },
                                   // Bullet list (Ctrl/Cmd+Shift+8)
                                   listBullet: {
                                        key: '8',
                                        shortKey: true,
                                        shiftKey: true,
                                        handler(this: any) {
                                             const isBullet = this.quill.getFormat().list === 'bullet';
                                             this.quill.format('list', isBullet ? false : 'bullet', 'user');
                                        },
                                   },
                                   // Align left (Ctrl/Cmd+Shift+L)
                                   alignLeft: {
                                        key: 'L',
                                        shortKey: true,
                                        shiftKey: true,
                                        handler(this: any) {
                                             this.quill.format('align', false, 'user');
                                        },
                                   },
                                   // Align center (Ctrl/Cmd+Shift+E)
                                   alignCenter: {
                                        key: 'E',
                                        shortKey: true,
                                        shiftKey: true,
                                        handler(this: any) {
                                             this.quill.format('align', 'center', 'user');
                                        },
                                   },
                                   // Align right (Ctrl/Cmd+Shift+R)
                                   alignRight: {
                                        key: 'R',
                                        shortKey: true,
                                        shiftKey: true,
                                        handler(this: any) {
                                             this.quill.format('align', 'right', 'user');
                                        },
                                   },
                                   // Align justify (Ctrl/Cmd+Shift+J)
                                   alignJustify: {
                                        key: 'J',
                                        shortKey: true,
                                        shiftKey: true,
                                        handler(this: any) {
                                             this.quill.format('align', 'justify', 'user');
                                        },
                                   },
                                   // Insert link (Ctrl/Cmd+K)
                                   link: {
                                        key: 'K',
                                        shortKey: true,
                                        handler(this: any) {
                                             const range = this.quill.getSelection();
                                             if (!range) return;
                                             const existing = this.quill.getFormat(range).link as string | undefined;
                                             const href = window.prompt('Enter link URL', existing || '');
                                             if (href === null) return;
                                             if (href) this.quill.format('link', href, 'user');
                                             else this.quill.format('link', false, 'user');
                                        },
                                   },
                                   // Clear formatting (Ctrl/Cmd+\)
                                   clean: {
                                        key: '\\',
                                        shortKey: true,
                                        handler(this: any) {
                                             const range = this.quill.getSelection();
                                             if (range) this.quill.removeFormat(range.index, range.length, 'user');
                                        },
                                   },
                                   // Cycle font (Ctrl/Cmd+Shift+F)
                                   fontCycle: {
                                        key: 'F',
                                        shortKey: true,
                                        shiftKey: true,
                                        handler(this: any) {
                                             const current = this.quill.getFormat().font as string | false | undefined;
                                             const next = getNextValue(fontWhitelist, current);
                                             this.quill.format('font', next || false, 'user');
                                        },
                                   },
                                   // Cycle size (Ctrl/Cmd+Shift+S)
                                   sizeCycle: {
                                        key: 'S',
                                        shortKey: true,
                                        shiftKey: true,
                                        handler(this: any) {
                                             const current = this.quill.getFormat().size as string | false | undefined;
                                             const next = getNextValue(sizeWhitelist, current);
                                             this.quill.format('size', next || false, 'user');
                                        },
                                   },
                              },
                         },
                    },
               });

               // Keep saved range up-to-date
               quillInstance.on('selection-change', (range: any) => {
                    if (range) savedRangeRef.current = range;
               });

               quillRef.current = quillInstance;

               // Initial content
               const startHTML = (typeof value === 'string' ? value : initialValue) || '';
               if (quillInstance.root.innerHTML !== startHTML) {
                    quillInstance.root.innerHTML = startHTML;
               }
               currentValueRef.current = startHTML;

               // Change handler
               handleTextChange = () => {
                    const html = quillInstance!.root.innerHTML;
                    if (html !== currentValueRef.current) {
                         currentValueRef.current = html;
                         if (commitModeRef.current === 'onChange') {
                              onChangeRef.current?.(html);
                         }
                    }
               };

               quillInstance.on('text-change', handleTextChange);
               quillInstance.root.addEventListener('blur', () => {
                    const html = quillInstance!.root.innerHTML;
                    onBlurRef.current?.(html);
                    if (commitModeRef.current === 'onBlur') {
                         onChangeRef.current?.(html);
                    }
               });

               // Cleanup listeners on unmount
               return () => {
                    toolbarNode.removeEventListener('mousedown', rememberSelection, true);
               };
          };

          const cleanupPromise = init();

          return () => {
               // Ensure async init cleanup runs once it finishes
               cleanupPromise.then((fn) => fn?.());
               const q = quillRef.current;
               if (q && handleTextChange) q.off('text-change', handleTextChange);
               if (q) {
                    q.root.replaceChildren(); // clear content safely
               }
               quillRef.current = null;
          };
     }, [toolbarNode, placeholder, toolbarId]);

     // Controlled updates
     useEffect(() => {
          const q = quillRef.current;
          if (!q) return;
          if (typeof value === 'string' && value !== currentValueRef.current) {
               if (q.root.innerHTML !== value) {
                    q.root.innerHTML = value;
               }
               currentValueRef.current = value;
          }
     }, [value]);

     return (
          <Box
               className={className}
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
                         overflow: 'visible',
                    },
                    '& .ql-container.ql-snow': {
                         border: '1px solid',
                         position: 'relative',
                         zIndex: 1,
                         flexGrow: 1,
                         display: 'flex',
                         flexDirection: 'column',
                    },
                    '& .ql-toolbar.ql-snow + .ql-container.ql-snow': {
                         borderTop: 0,
                    },
                    '& .ql-editor': {
                         fontFamily: theme.typography.fontFamily,
                         fontSize: theme.typography.body1.fontSize as any,
                         color: theme.palette.text.primary,
                         minHeight: `${heightEm}em`,
                         paddingBottom: theme.spacing(2),
                         '&.ql-blank::before': {
                              color: theme.palette.text.secondary,
                              fontStyle: 'normal',
                         },
                    },
               })}
          >
               <CustomToolbar id={toolbarId} ref={setToolbarNode} />
               <div ref={containerRef} />
          </Box>
     );
});

QuillEditor.displayName = 'QuillEditor';
export default QuillEditor;
