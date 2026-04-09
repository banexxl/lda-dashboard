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
                    <select className="ql-font" defaultValue="">
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

                    <select className="ql-size" defaultValue="">
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
                    <select className="ql-align" defaultValue="">
                         <option value="" />
                         <option value="center" />
                         <option value="right" />
                         <option value="justify" />
                    </select>
               </span>

               <span className="ql-formats">
                    <button className="ql-link" />
                    <button className="ql-clean" />
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
          let quillInstance: any | null = null;
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
               Size.whitelist = ['12px', '14px', '16px', '18px', '24px', '32px'];
               Quill.register(Size, true);

               const Align: any = Quill.import('attributors/style/align');
               Align.whitelist = ['', 'center', 'right', 'justify'];
               Quill.register(Align, true);

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
