'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Trash2, Upload } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type FileWithOptions = {
  file: File;
  paperType: 'blank' | 'lined' | 'grid';
}

export function DropBoxComponent() {
  const [files, setFiles] = useState<FileWithOptions[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prevFiles => [
      ...prevFiles,
      ...acceptedFiles.map(file => ({ file, paperType: 'blank' as const }))
    ])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    }
  })

  const handlePaperTypeChange = (fileIndex: number, paperType: 'blank' | 'lined' | 'grid') => {
    setFiles(prevFiles => 
      prevFiles.map((file, index) => 
        index === fileIndex ? { ...file, paperType } : file
      )
    )
  }

  const handleRemoveFile = (fileIndex: number) => {
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== fileIndex))
  }

  const handleSubmit = () => {
    // Devi usare la Promise.all()
  }

  return (
    <div>
      <div {...getRootProps()} className={`-full border-2 border-dashed rounded-lg p-8 mb-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}`}>
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-2" size={24} />
        <p>{isDragActive ? "Rilascia i file qui" : "Trascina i file PDF qui, o clicca per selezionarli"}</p>
      </div>

      {files.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">File caricati</h2>
          <ul className="space-y-3">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                <span className="truncate flex-grow mr-2">{file.file.name}</span>
                <Select value={file.paperType} onValueChange={(value: 'blank' | 'lined' | 'grid') => handlePaperTypeChange(index, value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Tipo di carta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blank">Bianco</SelectItem>
                    <SelectItem value="lined">Righe</SelectItem>
                    <SelectItem value="grid">Quadretti</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="destructive" size="icon" onClick={() => handleRemoveFile(index)} className="ml-2">
                  <Trash2 size={18} />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button onClick={handleSubmit} disabled={files.length === 0} className="w-full">
        Converti File
      </Button>
    </div>
  )
}