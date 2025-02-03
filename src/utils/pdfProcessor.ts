import pdfParse from 'pdf-parse';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function extractTextFromPDF(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async function(event) {
      try {
        if (!event.target?.result) throw new Error('No se pudo leer el archivo');
        const data = await pdfParse(event.target.result);
        resolve(data.text);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

export async function generateSummary(text: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Eres un experto en resumir documentos. Genera un resumen conciso pero completo del siguiente texto, organizando la información en secciones claras y puntos clave. Incluye los aspectos más importantes y relevantes."
        },
        {
          role: "user",
          content: text
        }
      ],
      model: "gpt-3.5-turbo",
    });

    return completion.choices[0]?.message?.content || 'No se pudo generar el resumen';
  } catch (error) {
    console.error('Error al generar el resumen:', error);
    throw new Error('Error al generar el resumen con IA');
  }
}