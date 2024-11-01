import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Mic, MicOff, Printer, Save, Plus, Template, Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

// Mock database for templates
const initialTemplates = {
  'appendectomy': {
    name: 'Appendectomy Template',
    content: 'Patient underwent {{procedure_type}} appendectomy. Incision was made in {{incision_location}}. The appendix was {{appendix_condition}}. Procedure duration: {{duration}} minutes. Blood loss: {{blood_loss}}ml.',
    variables: ['procedure_type', 'incision_location', 'appendix_condition', 'duration', 'blood_loss']
  },
  'cholecystectomy': {
    name: 'Cholecystectomy Template',
    content: 'Laparoscopic cholecystectomy performed using {{port_count}} ports. {{complications}} encountered. Gallbladder was {{gallbladder_condition}}. Operation time: {{duration}} minutes.',
    variables: ['port_count', 'complications', 'gallbladder_condition', 'duration']
  }
};

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
  const [templates, setTemplates] = useState(initialTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templateVariables, setTemplateVariables] = useState({});
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    variables: []
  });
  const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false);

  // Speech recognition setup (previous code remains the same)
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

        setTranscripts(prev => ({
          ...prev,
          [activeTab]: prev[activeTab] + ' ' + transcript
        }));
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      setRecognition(recognition);
    }
  }, []);

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

  const handleTemplateSelection = (templateKey) => {
    setSelectedTemplate(templateKey);
    const template = templates[templateKey];
    
    // Initialize template variables with empty values
    const initialVars = {};
    template.variables.forEach(variable => {
      initialVars[variable] = '';
    });
    setTemplateVariables(initialVars);
  };

  const handleVariableChange = (variable, value) => {
    setTemplateVariables(prev => ({
      ...prev,
      [variable]: value
    }));
  };

  const applyTemplate = () => {
  let content = templates[selectedTemplate].content;
  Object.entries(templateVariables).forEach(([key, value]) => {
    const variableValue = value || `[${key} not provided]`; // Provide default if undefined
    content = content.replace(`{{${key}}}`, variableValue);
  });
  setTranscripts(prev => ({
    ...prev,
    operation: content
  }));
};


  const saveNewTemplate = () => {
    const variableMatches = newTemplate.content.match(/{{([^}]+)}}/g) || [];
    const variables = variableMatches.map(match => match.replace(/{{|}}/g, ''));
    
    const templateKey = newTemplate.name.toLowerCase().replace(/\s+/g, '_');
    setTemplates(prev => ({
      ...prev,
      [templateKey]: {
        ...newTemplate,
        variables
      }
    }));
    setShowNewTemplateDialog(false);
    setNewTemplate({ name: '', content: '', variables: [] });
  };

  // Previous save and print functions remain the same
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
                  <div className="flex gap-2">
                    {section === 'operation' && (
                      <>
                        <Select value={selectedTemplate} onValueChange={handleTemplateSelection}>
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select template" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(templates).map(([key, template]) => (
                              <SelectItem key={key} value={key}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Dialog open={showNewTemplateDialog} onOpenChange={setShowNewTemplateDialog}>
                          <DialogTrigger asChild>
                            <Button variant="outline">
                              <Plus className="w-4 h-4 mr-2" />
                              New Template
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Create New Template</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="name">Template Name</Label>
                                <Input
                                  id="name"
                                  value={newTemplate.name}
                                  onChange={(e) => setNewTemplate(prev => ({
                                    ...prev,
                                    name: e.target.value
                                  }))}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="content">
                                  Template Content (Use variable_name for placeholders)
                                </Label>
                                <textarea
                                  id="content"
                                  className="min-h-[100px] w-full p-2 border rounded-md"
                                  value={newTemplate.content}
                                  onChange={(e) => setNewTemplate(prev => ({
                                    ...prev,
                                    content: e.target.value
                                  }))}
                                />
                              </div>
                            </div>
                            <Button onClick={saveNewTemplate}>Save Template</Button>
                          </DialogContent>
                        </Dialog>
                      </>
                    )}
                    <Button 
                      variant={isRecording ? "destructive" : "default"}
                      onClick={toggleRecording}
                    >
                      {isRecording ? <MicOff className="mr-2" /> : <Mic className="mr-2" />}
                      {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </Button>
                  </div>
                </div>
                
                {section === 'operation' && selectedTemplate && (
                  <Card className="p-4 mb-4 bg-gray-50">
                    <h3 className="font-semibold mb-3">Template Variables</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {templates[selectedTemplate].variables.map(variable => (
                        <div key={variable} className="space-y-2">
                          <Label htmlFor={variable}>
                            {variable.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </Label>
                          <Input
                            id={variable}
                            value={templateVariables[variable] || ''}
                            onChange={(e) => handleVariableChange(variable, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                    <Button className="mt-4" onClick={applyTemplate}>
                      Apply Template
                    </Button>
                  </Card>
                )}
                
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
