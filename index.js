import 'dotenv/config';
import express from 'express';
import multer from 'multer'
import { GoogleGenAI } from "@google/genai";

const app = express();
const upload = multer();
const ai = new GoogleGenAI ({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = "gemini-3.5-flash-lite";

app.use(express.json());

app.post('/generate-text', async(req, res)=>{
   const {prompt} = req.body;

   try {
    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
   })
   res.json({ text: result.text });
   }catch(error){
    console.error("error: ", error);
    res.status(500).json({error: "Failed to generate text"});
   }

});

app.post('/generate-from-image', upload.single("image"), async (req, res) => {
   try {
      if (!req.file) {
         return res.status(400).json({ error: "File gambar wajib diunggah dengan key/field 'image'" });
      }

      const { prompt } = req.body;
      const base64Image = req.file.buffer.toString('base64');

      const result = await ai.models.generateContent({
         model: GEMINI_MODEL,
         contents: [
            {
               role: "user",
               parts: [
                  { text: prompt || "Describe this image" },
                  {
                     inlineData: {
                        mimeType: req.file.mimetype,
                        data: base64Image
                     }
                  }
               ]
            }
         ],
      });
      res.json({ text: result.text });
   } catch (error) {
      console.error("error: ", error);
      res.status(500).json({ error: "Failed to generate text from image" });
   }
});   
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));