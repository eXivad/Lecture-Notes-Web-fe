'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Trash2, Upload, LoaderCircle } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from './ui/badge'

enum PaperType{
  Blank = 'Blank',
  Lined = "Lined",
  Grid = "Grid"
}

type FileWithOptions = {
  file: File;
  fileConverted?: String
  paperType: PaperType;
  isConverting?: boolean
  errorConverting?: boolean
}

export function DropBoxComponent() {
  const [files, setFiles] = useState<FileWithOptions[]>([])
  const [isConverting, setIsConverting] = useState<boolean>(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prevFiles => [
      ...prevFiles,
      ...acceptedFiles.map(file => ({ file, paperType: PaperType.Blank}))
    ])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    }
  })

  const handlePaperTypeChange = (fileIndex: number, paperType: PaperType) => {
    setFiles(prevFiles => 
      prevFiles.map((file, index) => 
        index === fileIndex ? { ...file, paperType } : file
      )
    )
  }

  const handleRemoveFile = (fileIndex: number) => {
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== fileIndex))
  }

  const convertFile = async (file: FileWithOptions) => {
    const formData = new FormData()
    formData.append('pdftoconvert', file.file)
    formData.append('paper_type', file.paperType)

    file.isConverting = true
    /*
    const response: Response = await fetch(process.env.NEXT_PUBLIC_API_CONVERTER_SITE!, {
      method: 'POST',
      mode: 'cors',
      body: formData
    })

    if (!response.ok){
      file.errorConverting = true
      throw new Error('Errore durante la conversione del file')
    }

    const fileConvertedData = await response.json()

    if (!fileConvertedData){
      file.errorConverting = true
      throw new Error('Errore durante la conversione del file')
    }

    file.isConverting = false
    file.fileConverted = fileConvertedData.download_link
    */
    // TODO: Devi provare a capire se i badge funzionano facendo attenzione a cambiare le opzioni con setFiles
  }

  const handleSubmit = async () => {

    setIsConverting(true)
    try {
      await Promise.all(files.map(file => convertFile(file)))
      console.log('Tutti i file sono stati convertiti con successo')
    } catch (error) {
      console.error('Errore durante la conversione dei file:', error)
    } finally {
      setIsConverting(false)
    }
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
              <li key={index} className="flex items-center justify-between gap-2 p-3 rounded-lg border">
                <span className="truncate flex-grow">{file.file.name}</span>
                
                <Select value={file.paperType} onValueChange={(value: PaperType) => handlePaperTypeChange(index, value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Tipo di carta" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PaperType).map( (type) => (
                      <SelectItem value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge className="rounded-full" variant={file.errorConverting ? "destructive" : "secondary"}>
                  {file.isConverting ? <>Convertendo <LoaderCircle className='animate-spin'/></> : <>Aggiunto</>}
                  {file.errorConverting ? <>Errore</> : <></>}
                </Badge>
                <Button variant="destructive" size="icon" onClick={() => handleRemoveFile(index)} className="">
                  <Trash2 size={18} />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button onClick={handleSubmit} disabled={files.length === 0 || isConverting} className="w-full">
        {isConverting ? 
        <>
          Convertendo
          <LoaderCircle size={18} className='animate-spin'/>
        </>
        :
        <>Converti File</>
        }
      </Button>
    </div>
  )
}