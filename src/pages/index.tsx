import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { FileText, Upload, Loader2, Download } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'
import { extractTextFromPDF, generateSummary } from "@/utils/pdfProcessor"
import { Progress } from "@/components/ui/progress"

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 12,
    lineHeight: 1.5,
    textAlign: 'justify',
  },
});

// Componente del PDF
const PDFDocument = ({ summary, fileName }: { summary: string, fileName: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View>
        <Text style={styles.title}>Resumen del documento: {fileName}</Text>
        <Text style={styles.text}>{summary}</Text>
      </View>
    </Page>
  </Document>
);

export default function IndexPage() {
  const [file, setFile] = useState<File | null>(null)
  const [summary, setSummary] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [pdfReady, setPdfReady] = useState(false)
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0]
    if (uploadedFile?.type !== "application/pdf") {
      setError("Por favor, sube un archivo PDF válido")
      return
    }
    setFile(uploadedFile)
    setError("")
    setPdfReady(false)
    setSummary("")
    setProgress(0)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"]
    },
    maxFiles: 1
  })

  const handleSummarize = async () => {
    if (!file) return
    setLoading(true)
    setSummary("")
    setError("")
    setPdfReady(false)
    setProgress(0)

    try {
      // Extracción del texto
      setProgress(25)
      const text = await extractTextFromPDF(file)
      
      // Generación del resumen
      setProgress(50)
      const generatedSummary = await generateSummary(text)
      
      setProgress(100)
      setSummary(generatedSummary)
      setPdfReady(true)
    } catch (err) {
      setError("Error al procesar el PDF. Por favor, intenta de nuevo.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = async () => {
    if (!summary || !file) return

    try {
      const blob = await pdf(
        <PDFDocument summary={summary} fileName={file.name} />
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `resumen-${file.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError("Error al generar el PDF del resumen")
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 space-y-8">
      <motion.section 
        className="text-center space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Badge variant="secondary" className="mb-4">
          PDF Summarizer
        </Badge>
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Resumen Inteligente de PDFs
        </h1>
        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
          Sube tu PDF y obtén un resumen conciso y preciso en segundos
        </p>
      </motion.section>

      <div className="max-w-3xl mx-auto space-y-8">
        <Card className="p-8">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary"}`}
          >
            <input {...getInputProps()} />
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-lg">Suelta el archivo aquí...</p>
            ) : (
              <div className="space-y-2">
                <p className="text-lg">Arrastra y suelta tu PDF aquí, o haz clic para seleccionar</p>
                <p className="text-sm text-gray-500">Solo archivos PDF</p>
              </div>
            )}
          </div>

          {file && (
            <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
              <p className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {file.name}
              </p>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            className="w-full mt-4" 
            size="lg"
            disabled={!file || loading}
            onClick={handleSummarize}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Resumir PDF
              </>
            )}
          </Button>

          {loading && progress > 0 && (
            <div className="mt-4 space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                {progress < 50 ? "Extrayendo texto del PDF..." : 
                 progress < 100 ? "Generando resumen..." : 
                 "¡Resumen completado!"}
              </p>
            </div>
          )}
        </Card>

        {summary && (
          <Card className="p-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Resumen</h2>
              <Button
                variant="outline"
                onClick={downloadPDF}
                disabled={!pdfReady}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar PDF
              </Button>
            </div>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
              {summary}
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}