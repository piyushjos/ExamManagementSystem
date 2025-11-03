import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Grid,
  Typography,
  FormControlLabel,
  Radio,
  RadioGroup,
  IconButton,
  Switch,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CodeIcon from "@mui/icons-material/Code";
import api from "../../services/api";

export const AddQuestionDialog = ({ open, onClose, examId, onQuestionAdded }) => {
  const [questions, setQuestions] = useState([]);

  // 🔵 AI state
  const [aiTopic, setAiTopic] = useState("");
  const [aiNumQuestions, setAiNumQuestions] = useState(5);
  const [aiMarks, setAiMarks] = useState(2);
  const [aiQuestions, setAiQuestions] = useState([]); // array from backend
  const [aiIndex, setAiIndex] = useState(0);

  // current form question (your old state)
  const [currentQuestion, setCurrentQuestion] = useState({
    text: "",
    type: "MULTIPLE_CHOICE",
    marks: 2,
    isCodeQuestion: false,
    codeSnippet: "",
    options: [
      { id: "1", text: "", isCorrect: false },
      { id: "2", text: "", isCorrect: false },
      { id: "3", text: "", isCorrect: false },
      { id: "4", text: "", isCorrect: false },
    ],
  });

  // keep your TRUE_FALSE logic
  useEffect(() => {
    console.log("ADD QUESTION DIALOG — AI VERSION LOADED");

    if (currentQuestion.type === "TRUE_FALSE") {
      setCurrentQuestion((prev) => ({
        ...prev,
        options: [
          { id: "tf1", text: "True", isCorrect: false },
          { id: "tf2", text: "False", isCorrect: false },
        ],
      }));
    }
  }, [currentQuestion.type]);

  // 🔵 convert AI → your UI shape
  const mapAIToUI = (aiQ) => {
    return {
      text: aiQ.question,
      type: "MULTIPLE_CHOICE",
      marks: aiQ.marks ?? 2,
      isCodeQuestion: false,
      codeSnippet: "",
      options: aiQ.options.map((opt, idx) => ({
        id: (idx + 1).toString(),
        text: opt,
        isCorrect: aiQ.correctOption === idx,
      })),
    };
  };

  // 🔵 call backend through api.js (NOT fetch)
  const handleGenerateWithAI = async () => {
    try {
      const data = await api.ai.generateQuestions({
        topic: aiTopic,
        numQuestions: Number(aiNumQuestions),
        marksPerQuestion: Number(aiMarks),
      });
      if (!data || !Array.isArray(data)) {
        alert("AI didn’t return questions");
        return;
      }
      const uiQuestions = data.map(mapAIToUI);
      setAiQuestions(uiQuestions);
      setAiIndex(0);
      if (uiQuestions.length > 0) {
        setCurrentQuestion(uiQuestions[0]);
      }
    } catch (err) {
      console.error(err);
      alert("AI generation failed");
    }
  };

  // show next AI question (if multiple came)
  const loadNextAIQuestion = () => {
    if (aiIndex + 1 < aiQuestions.length) {
      const nextIndex = aiIndex + 1;
      setAiIndex(nextIndex);
      setCurrentQuestion(aiQuestions[nextIndex]);
    } else {
      alert("No more AI questions");
    }
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion({
      ...currentQuestion,
      [name]: value,
    });
  };

  const handleCodeToggle = (e) => {
    setCurrentQuestion({
      ...currentQuestion,
      isCodeQuestion: e.target.checked,
    });
  };

  const handleOptionChange = (id, field, value) => {
    if (currentQuestion.type === "TRUE_FALSE" && field === "text") {
      return;
    }
    setCurrentQuestion({
      ...currentQuestion,
      options: currentQuestion.options.map((option) =>
          option.id === id ? { ...option, [field]: value } : option
      ),
    });
  };

  const setCorrectOption = (id) => {
    setCurrentQuestion({
      ...currentQuestion,
      options: currentQuestion.options.map((option) => ({
        ...option,
        isCorrect: option.id === id,
      })),
    });
  };

  const addOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [
        ...currentQuestion.options,
        { id: Date.now().toString(), text: "", isCorrect: false },
      ],
    });
  };

  const removeOption = (id) => {
    if (currentQuestion.options.length <= 2) return;
    setCurrentQuestion({
      ...currentQuestion,
      options: currentQuestion.options.filter((option) => option.id !== id),
    });
  };

  const addQuestion = () => {
    const hasCorrectOption = currentQuestion.options.some((opt) => opt.isCorrect);
    if (!hasCorrectOption) {
      alert("Please mark at least one option as correct");
      return;
    }
    const newQuestion = {
      ...currentQuestion,
      id: Date.now().toString(),
    };
    setQuestions((prev) => [...prev, newQuestion]);

    // if AI list still has more, load next
    if (aiQuestions.length > 0 && aiIndex + 1 < aiQuestions.length) {
      const nextIndex = aiIndex + 1;
      setAiIndex(nextIndex);
      setCurrentQuestion(aiQuestions[nextIndex]);
    } else {
      // normal reset
      setCurrentQuestion({
        text: "",
        type: "MULTIPLE_CHOICE",
        marks: 2,
        isCodeQuestion: false,
        codeSnippet: "",
        options: [
          { id: "1", text: "", isCorrect: false },
          { id: "2", text: "", isCorrect: false },
          { id: "3", text: "", isCorrect: false },
          { id: "4", text: "", isCorrect: false },
        ],
      });
      // also clear AI if you want:
      // setAiQuestions([]);
      // setAiIndex(0);
    }
  };

  const totalMarksAdded = questions.reduce((sum, q) => sum + Number(q.marks), 0);

  const saveAllQuestions = async () => {
    try {
      // if user forgot to click "Add Question" for the last one, add it
      if (currentQuestion.text.trim() !== "") {
        // BUT: we don't want to duplicate marks if they already added it
        const hasCorrectOption = currentQuestion.options.some((opt) => opt.isCorrect);
        if (hasCorrectOption) {
          const newQuestion = {
            ...currentQuestion,
            id: Date.now().toString(),
          };
          setQuestions((prev) => [...prev, newQuestion]);
        }
      }

      // we need the latest questions to send
      const finalQuestions = currentQuestion.text.trim()
          ? [...questions,
            {
              ...currentQuestion,
              id: Date.now().toString(),
            },
          ]
          : questions;

      const formattedQuestions = finalQuestions.map((q) => {
        const correctOption = q.options.find((opt) => opt.isCorrect);
        return {
          examId,
          questionText: q.text,
          questionType: q.type,
          marks: Number(q.marks),
          isCodeQuestion: q.isCodeQuestion,
          codeSnippet: q.codeSnippet,
          options: JSON.stringify(
              q.options.map((opt) => ({
                optionText: opt.text,
                isCorrect: opt.isCorrect,
              }))
          ),
          correctAnswer: correctOption ? correctOption.text : "",
        };
      });

      // save to backend
      for (const question of formattedQuestions) {
        await api.questions.createQuestion(question);
      }

      if (onQuestionAdded) {
        onQuestionAdded(formattedQuestions);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save questions:", error);
      alert("Failed to save questions. Please try again.");
    }
  };

  return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">

        <DialogTitle>

          Add Questions to Exam helllloooooo{" "}
          <Typography variant="subtitle2" sx={{ ml: 2, display: "inline" }}>
            Total Marks Added: {totalMarksAdded}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {/* 🔵 AI box */}
          <Box
              sx={{
                mb: 2,
                p: 2,
                border: "1px solid #ddd",
                borderRadius: 1,
                bgcolor: "#fafafa",
              }}
          >
            <Typography variant="subtitle1">AI Assist (optional)</Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
              <TextField
                  label="Topic"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  size="small"
              />
              <TextField
                  label="No. of questions"
                  type="number"
                  value={aiNumQuestions}
                  onChange={(e) => setAiNumQuestions(e.target.value)}
                  size="small"
              />
              <TextField
                  label="Marks"
                  type="number"
                  value={aiMarks}
                  onChange={(e) => setAiMarks(e.target.value)}
                  size="small"
              />
              <Button variant="outlined" onClick={handleGenerateWithAI}>
                Generate with AI
              </Button>
              {aiQuestions.length > 0 && (
                  <Button variant="text" onClick={loadNextAIQuestion}>
                    Next AI Question ({aiIndex + 1}/{aiQuestions.length})
                  </Button>
              )}
            </Box>
          </Box>

          {/* your existing form */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Question {questions.length + 1}
            </Typography>
            <TextField
                label="Question Text"
                name="text"
                value={currentQuestion.text}
                onChange={handleQuestionChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
                required
            />
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                    label="Question Type"
                    name="type"
                    select
                    SelectProps={{ native: true }}
                    value={currentQuestion.type}
                    onChange={handleQuestionChange}
                    fullWidth
                    variant="outlined"
                    margin="normal"
                >
                  <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                  <option value="TRUE_FALSE">True/False</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                    label="Marks"
                    name="marks"
                    type="number"
                    value={currentQuestion.marks}
                    onChange={handleQuestionChange}
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
            </Grid>
            <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
              <FormControlLabel
                  control={
                    <Switch
                        checked={currentQuestion.isCodeQuestion}
                        onChange={handleCodeToggle}
                        color="primary"
                    />
                  }
                  label="Include Code Snippet"
              />
              {currentQuestion.isCodeQuestion && (
                  <CodeIcon color="primary" sx={{ ml: 1 }} />
              )}
            </Box>
            {currentQuestion.isCodeQuestion && (
                <TextField
                    label="Code Snippet"
                    name="codeSnippet"
                    value={currentQuestion.codeSnippet}
                    onChange={handleQuestionChange}
                    fullWidth
                    multiline
                    rows={6}
                    margin="normal"
                    placeholder="Enter your code snippet here..."
                    InputProps={{ style: { fontFamily: "monospace" } }}
                />
            )}
            <Box sx={{ mt: 3 }}>
              <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
              >
                <Typography variant="subtitle1">Options</Typography>
                {currentQuestion.type === "MULTIPLE_CHOICE" && (
                    <Button
                        startIcon={<AddIcon />}
                        onClick={addOption}
                        size="small"
                        variant="outlined"
                    >
                      Add Option
                    </Button>
                )}
              </Box>
              <FormControl component="fieldset" fullWidth>
                <RadioGroup>
                  {currentQuestion.options.map((option, index) => (
                      <Box
                          key={option.id}
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <FormControlLabel
                            value={option.id}
                            control={
                              <Radio
                                  checked={option.isCorrect}
                                  onChange={() => setCorrectOption(option.id)}
                                  required
                              />
                            }
                            label=""
                            sx={{ mr: 0 }}
                        />
                        <TextField
                            value={option.text}
                            onChange={(e) =>
                                handleOptionChange(option.id, "text", e.target.value)
                            }
                            placeholder={`Option ${index + 1}`}
                            fullWidth
                            size="small"
                            required
                            disabled={currentQuestion.type === "TRUE_FALSE"}
                        />
                        {currentQuestion.type === "MULTIPLE_CHOICE" &&
                            currentQuestion.options.length > 2 && (
                                <IconButton
                                    onClick={() => removeOption(option.id)}
                                    color="error"
                                    size="small"
                                >
                                  <DeleteIcon />
                                </IconButton>
                            )}
                      </Box>
                  ))}
                </RadioGroup>
              </FormControl>
              {currentQuestion.type === "TRUE_FALSE" && (
                  <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: "block" }}
                  >
                    For True/False questions, options are fixed as "True" and "False"
                  </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
              onClick={addQuestion}
              variant="outlined"
              disabled={!currentQuestion.text.trim()}
          >
            Add Question
          </Button>
          <Button
              onClick={saveAllQuestions}
              variant="contained"
              color="primary"
              disabled={questions.length === 0 && !currentQuestion.text.trim()}
          >
            Save All Questions
          </Button>
        </DialogActions>
      </Dialog>
  );
};

export default AddQuestionDialog;
