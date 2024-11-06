'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Trash2, Upload, LoaderCircle, Download, RotateCcw} from 'lucide-react'

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
  downloaded?: boolean
}

export function DropBoxComponent() {
  const [files, setFiles] = useState<FileWithOptions[]>([])
  const [isConverting, setIsConverting] = useState<boolean>(false)
  const [isConverted, setIsConverted] = useState<boolean>(false)

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

  const handleDownloadFile = async (fileIndex: number) => {
    setFiles(prevFiles => 
      prevFiles.map((file, index) => 
        index === fileIndex ? { ...file, downloaded: true} : file
      )
    )

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_CONVERTER_SITE!+files[fileIndex].fileConverted)
      if (!response.ok) {
        throw new Error('Errore durante il download del file')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = files[fileIndex].file.name
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Errore durante il download del file:', error)
    }

    
  }

  const convertFile = async (fileToConvert: FileWithOptions) => {
    const formData = new FormData()
    formData.append('pdftoconvert', fileToConvert.file)
    formData.append('paper_type', fileToConvert.paperType)

    //Aggiorna il file in Conversione
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.file === fileToConvert.file ? { ...file, isConverting: true, errorConverting: false } : file
      )
    )

    try{
      const response: Response = await fetch(process.env.NEXT_PUBLIC_API_CONVERTER_SITE!+"/generate", {
        method: 'POST',
        mode: 'cors',
        body: formData
      })

      if (!response.ok) 
        throw new Error()

      const fileConvertedData = await response.json()
      
      if (!fileConvertedData) 
        throw new Error()

      // Aggiorna lo stato per indicare che la conversione è completata
      setFiles(prevFiles => 
        prevFiles.map(file => 
          file.file === fileToConvert.file ? { ...file, isConverting: false, fileConverted: fileConvertedData.download_link, errorConverting: false } : file
        )
      )
      
    }catch(e){
      setFiles(prevFiles => 
        prevFiles.map(file => 
          file.file === fileToConvert.file ? { ...file, isConverting: false, errorConverting: true } : file
        )
      )

      throw e
    } finally {
      setFiles(prevFiles => 
        prevFiles.map(file => 
          file.file === fileToConvert.file ? { ...file, isConverting: false } : file
        )
      )
    }
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
      setIsConverted(true)
    }
  }

  return (
    <div>
      <div {...getRootProps()} className={`w-full border-2 border-dashed rounded-lg p-8 mb-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'} ${isConverting || isConverted ? "hidden" : ""}`}>
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
                <Badge className="rounded-full flex gap-2" variant={file.fileConverted ? "success" : file.errorConverting ? "destructive" : file.isConverting ? "secondary" : "outline"}>
                  {file.fileConverted ? <>Terminato</> : null}
                  {file.isConverting ? <>Convertendo <LoaderCircle size={10} className='animate-spin'/></> : null}
                  {file.errorConverting ? <>Errore</> : null}
                  {!file.isConverting && !file.errorConverting && !file.fileConverted ? <>Aggiunto</> : null}
                </Badge>
                {file.fileConverted ? 
                  <Button disabled={file.downloaded} onClick={() => handleDownloadFile(index)}>
                    <Download size={18}/>
                    {!file.downloaded ? "Scarica" : "Scaricato"}
                  </Button>
                  :
                  file.errorConverting ?
                  <></>
                  :
                  <Button variant="destructive" size="icon" onClick={() => handleRemoveFile(index)} className="">
                    <Trash2 size={18} />
                  </Button>
                }
                
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button onClick={!isConverted ? handleSubmit : () => window.location.reload()} disabled={files.length === 0 || isConverting} className="w-full">
        {isConverting ? 
        <>
          <LoaderCircle size={18} className='animate-spin'/>
          Convertendo
        </>
        :
        isConverted ?
        <>
        <RotateCcw size={18}/>
        Converti Anccora
        </>
        :
        <>Converti</>
        }
      </Button>
    </div>
  )
}