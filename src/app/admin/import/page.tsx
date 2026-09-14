"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UploadCloud, Check, AlertTriangle } from "lucide-react";

export default function ExcelImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
    }
  };

  const processExcel = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Expected columns: Data, Nome, Entrada, Justificativa, Saída
      const json: any[] = XLSX.utils.sheet_to_json(worksheet);

      // Aqui faríamos o mapeamento real para inserir via API/Server Action
      // Como exemplo, simulando um log do json parseado
      console.log("Dados lidos da planilha:", json);

      // Simulando delay de insert
      await new Promise(r => setTimeout(r, 2000));
      
      setSuccess(true);
      setFile(null);
    } catch (err) {
      setError("Falha ao processar o arquivo. Verifique o formato.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Card className="border-zinc-800 bg-zinc-900/40">
        <CardHeader>
          <CardTitle>Importar Planilha de Pontos</CardTitle>
          <CardDescription>Faça o upload do Excel antigo (Data, Nome, Entrada, Justificativa, Saída) para o novo banco de dados.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-2 border-dashed border-zinc-700 bg-zinc-950/50 rounded-lg p-12 text-center hover:bg-zinc-900 transition-colors cursor-pointer relative">
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center gap-4">
              <UploadCloud className="w-12 h-12 text-emerald-500" />
              <div>
                <p className="text-zinc-100 font-medium">
                  {file ? file.name : "Arraste e solte ou clique para selecionar o arquivo Excel"}
                </p>
                <p className="text-zinc-400 text-sm mt-1">Suporta .xlsx e .xls</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 p-4 rounded-md">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 p-4 rounded-md">
              <Check className="w-5 h-5" />
              <span>Planilha processada e registros importados com sucesso!</span>
            </div>
          )}

          <div className="flex justify-end">
            <Button 
              onClick={processExcel}
              disabled={!file || loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? "Processando e Importando..." : "Iniciar Importação"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
