import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Mic, MicOff, Printer, Save, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const MedicalTranscription = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [activeSection, setActiveSection] = useState('advice');
  const [transcripts, setTranscripts] = useState({
    advice: '',
    operation: '',
    postOperative: '',
    dischargeSummary: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for speech recognition support
    if ('webkitSpeechRecognition' in window) {
      const recognitionInstance = new window.webkitSpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US'; // Set language to English

      recognitionInstance.onresult = (event) => {
        if (!activeSection) return;

        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          setTranscripts(prev => {
            const currentText = prev[activeSection] || '';
            
            // Append new transcript text, avoiding unnecessary duplications
            const newText = (currentText + ' ' + transcript).trim();
            
            return {
              ...prev,
              [activeSection]: newText
            };
          });
        }
      };

      recognitionInstance.onstart = () => {
        setError(null);
      };

      recognitionInstance.onend = () => {
        if (isRecording) {
          try {
            recognitionInstance.start();
          } catch (err) {
            setError('Recording stopped unexpectedly');
            setIsRecording(false);
          }
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech Recognition Error: ${event.error}`);
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    } else {
      setError('Speech recognition not supported in this browser');
    }
  }, [activeSection]);

  const toggleRecording = () => {
    if (!recognition) {
      setError('Speech recognition is not available');
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      try {
        recognition.start();
        setIsRecording(true);
      } catch (err) {
        setError('Could not start recording');
        setIsRecording(false);
      }
    }
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
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medical-transcription-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printDocument = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Medical Transcription Report</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px; 
              line-height: 1.6; 
            }
            h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
            h2 { color: #34495e; margin-top: 20px; }
            .section { 
              background-color: #f9f9f9; 
              padding: 15px; 
              border-radius: 5px; 
              margin-bottom: 15px; 
            }
          </style>
        </head>
        <body>
          <h1>Medical Transcription Report</h1>
          
          <div class="section">
            <h2>Advice</h2>
            <p>${transcripts.advice || 'No advice recorded'}</p>
          </div>
          
          <div class="section">
            <h2>Operation Details</h2>
            <p>${transcripts.operation || 'No operation details recorded'}</p>
          </div>
          
          <div class="section">
            <h2>Post-Operative Notes</h2>
            <p>${transcripts.postOperative || 'No post-operative notes recorded'}</p>
          </div>
          
          <div class="section">
            <h2>Discharge Summary</h2>
            <p>${transcripts.dischargeSummary || 'No discharge summary recorded'}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-4xl mx-auto px-4">
        <Card className="shadow-lg border-none">
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                <FileText className="mr-3 text-blue-600" size={32} />
                Medical Transcription
              </h1>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Tabs 
              defaultValue="advice" 
              className="w-full" 
              onValueChange={(value) => setActiveSection(value)}
            >
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="advice">Advice</TabsTrigger>
                <TabsTrigger value="operation">Operation</TabsTrigger>
                <TabsTrigger value="postOperative">Post-Operative</TabsTrigger>
                <TabsTrigger value="dischargeSummary">Discharge Summary</TabsTrigger>
              </TabsList>

              {Object.entries(transcripts).map(([section, text]) => (
                <TabsContent key={section} value={section}>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-gray-700 capitalize">
                        {section.replace(/([A-Z])/g, ' $1').trim()}
                      </h2>
                      <Button 
                        onClick={toggleRecording}
                        variant={isRecording ? "destructive" : "default"}
                        className="flex items-center"
                      >
                        {isRecording ? (
                          <>
                            <MicOff className="mr-2" /> Stop Recording
                          </>
                        ) : (
                          <>
                            <Mic className="mr-2" /> Start Recording
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <textarea
                      className="w-full h-64 p-4 border-2 border-gray-200 rounded-lg 
                                 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                                 transition duration-200 ease-in-out
                                 text-gray-700 placeholder-gray-400"
                      value={text}
                      onChange={(e) => handleTextChange(section, e.target.value)}
                      placeholder={`Enter ${section.replace(/([A-Z])/g, ' $1').toLowerCase()} notes here...`}
                    />
                  </div>
                </TabsContent>
              ))}

              <div className="flex justify-end space-x-4 mt-6">
                <Button 
                  onClick={saveDocument} 
                  variant="outline" 
                  className="hover:bg-gray-100 transition duration-200"
                >
                  <Save className="mr-2" />
                  Save
                </Button>
                <Button 
                  onClick={printDocument}
                  className="bg-blue-600 hover:bg-blue-700 transition duration-200"
                >
                  <Printer className="mr-2" />
                  Print
                </Button>
              </div>
            </Tabs>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MedicalTranscription;
