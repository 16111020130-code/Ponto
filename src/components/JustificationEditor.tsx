"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from './ui/button';

interface JustificationEditorProps {
  onSave: (html: string) => void;
  onCancel: () => void;
}

export function JustificationEditor({ onSave, onCancel }: JustificationEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Desculpe o atraso. O motivo foi...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-emerald min-h-[150px] w-full rounded-md border border-zinc-700 bg-zinc-950 p-3 text-sm ring-offset-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50',
      },
    },
  });

  return (
    <div className="space-y-4">
      <div className="border border-zinc-800 rounded-md overflow-hidden bg-zinc-900/50 p-2 flex gap-2">
         {/* Barra de Ferramentas Simples */}
         <Button 
            variant="ghost" 
            size="sm"
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={editor?.isActive('bold') ? 'bg-zinc-800' : ''}
         >
           N
         </Button>
         <Button 
            variant="ghost" 
            size="sm"
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={editor?.isActive('italic') ? 'bg-zinc-800' : ''}
         >
           I
         </Button>
      </div>
      <EditorContent editor={editor} />
      
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} type="button">Cancelar</Button>
        <Button 
          onClick={() => onSave(editor?.getHTML() || '')} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          type="button"
        >
          Salvar Justificativa
        </Button>
      </div>
    </div>
  );
}
