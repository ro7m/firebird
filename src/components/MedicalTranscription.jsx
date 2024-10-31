import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Mic, MicOff, Printer, Save } from 'lucide-react';

const MedicalTranscription = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [transcripts, setTranscripts] = useState({
    advice: '',
    operation: '',
    postOperative: '',
    dischargeSummary: ''
  });
  const [activeTab, setActiveTab] = useState('advice');

  const handleTranscript = useCallback((transcript) => {
    setTranscripts(prev => ({
      ...prev,
      [activeTab]: (prev[activeTab] + ' ' + transcript).trim()
    }));
  }, [activeTab]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');

        handleTranscript(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      setRecognition(recognition);

      return () => {
        if (recognition) {
          recognition.stop();
        }
      };
    }
  }, [handleTranscript]);

  const toggleRecording = () => {
    if (isRecording) {
      recognition?.stop();
    } else {
      recognition?.start();
    }
    setIsRecording(!isRecording);
  };

  const handleTextChange = (section, value) => {
    setTranscripts(prev => ({
      ...prev,
      [section]: value
    }));
  };

  const saveDocument = () => {
    const content = `
      Medical Transcription Report
      
      Advice:
      ${transcripts.advice}
      
      Operation Details:
      ${transcripts.operation}
      
      Post-Operative Notes:
      ${transcripts.postOperative}
      
      Discharge Summary:
      ${transcripts.dischargeSummary}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'medical-transcription.txt';
    link.click();
  };

  const printDocument = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Medical Transcription Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h2 { color: #2c3e50; }
            .section { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>Medical Transcription Report</h1>
          
          <div class="section">
            <h2>Advice</h2>
            <p>${transcripts.advice}</p>
          </div>
          
          <div class="section">
            <h2>Operation Details</h2>
            <p>${transcripts.operation}</p>
          </div>
          
          <div class="section">
            <h2>Post-Operative Notes</h2>
            <p>${transcripts.postOperative}</p>
          </div>
          
          <div class="section">
            <h2>Discharge Summary</h2>
            <p>${transcripts.dischargeSummary}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Medical Transcription</h1>
        
        <Tabs defaultValue="advice" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="advice">Advice</TabsTrigger>
            <TabsTrigger value="operation">Operation</TabsTrigger>
            <TabsTrigger value="postOperative">Post-Operative</TabsTrigger>
            <TabsTrigger value="dischargeSummary">Discharge Summary</TabsTrigger>
          </TabsList>

          {Object.entries(transcripts).map(([section, text]) => (
            <TabsContent key={section} value={section}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold capitalize">
                    {section.replace(/([A-Z])/g, ' $1').trim()}
                  </h2>
                  <Button 
                    variant={isRecording ? "destructive" : "default"}
                    onClick={toggleRecording}
                  >
                    {isRecording ? <MicOff className="mr-2" /> : <Mic className="mr-2" />}
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </Button>
                </div>
                
                <textarea
                  className="w-full h-64 p-4 border rounded-md"
                  value={text}
                  onChange={(e) => handleTextChange(section, e.target.value)}
                  placeholder={`Enter ${section.replace(/([A-Z])/g, ' $1').toLowerCase()} notes here...`}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex justify-end space-x-4 mt-6">
          <Button onClick={saveDocument} variant="outline">
            <Save className="mr-2" />
            Save
          </Button>
          <Button onClick={printDocument}>
            <Printer className="mr-2" />
            Print
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default MedicalTranscription;
