import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Divider,
  Typography,
  Switch,
  FormControlLabel,
  Box,
} from "@mui/material";
import api from '../../services/api.js'

export const EnhancedAddExamDialog = ({ open, onClose, onAddExam, courses }) => {
  // Exam details
  const [examData, setExamData] = useState({
    title: "",
    courseId: "",
    duration: 60,
    totalScore: "",
  });

  // Saved questions
  const [questions, setQuestions] = useState([]);

  // Step control
  const [step, setStep] = useState("exam-details");

  // 🔵 AI state (copied idea from other component)
  const [aiTopic, setAiTopic] = useState("");
  const [aiNumQuestions, setAiNumQuestions] = useState(5);
  const [aiMarks, setAiMarks] = useState(5); // we lock to 5 anyway
  const [aiQuestions, setAiQuestions] = useState([]); // AI-generated list
  const [aiIndex, setAiIndex] = useState(0);

  // helper for default options
  const getDefaultOptions = (type) => {
    if (type === "TRUE_FALSE") {
      return [
        { optionText: "True", isCorrect: false },
        { optionText: "False", isCorrect: false },
      ];
    }
    return [
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
    ];
  };

  // Question form (what user is currently editing)
  const [questionForm, setQuestionForm] = useState({
    text: "",
    type: "MULTIPLE_CHOICE",
    marks: 5,
    isCodeQuestion: false,
    codeSnippet: "",
    options: getDefaultOptions("MULTIPLE_CHOICE"),
  });

  // 🔵 AI → UI mapper for THIS component shape
  const mapAIToUI = (aiQ) => {
    // aiQ expected: { question, options: [...], correctOption: index, marks? }
    const options =
        Array.isArray(aiQ.options) && aiQ.options.length > 0
            ? aiQ.options.map((opt, idx) => ({
              optionText: opt,
              isCorrect: aiQ.correctOption === idx,
            }))
            : getDefaultOptions("MULTIPLE_CHOICE");

    // make sure at least 1 option is correct
    const hasCorrect = options.some((o) => o.isCorrect);
    if (!hasCorrect && options.length > 0) {
      options[0].isCorrect = true;
    }

    return {
      text: aiQ.question ?? "",
      type: "MULTIPLE_CHOICE",
      marks: 5, // your flow locks to 5
      isCodeQuestion: false,
      codeSnippet: "",
      options,
    };
  };

  // 🔵 call backend to generate AI questions
  const handleGenerateWithAI = async () => {
    try {
      // 👇 your api.js puts AI under questions.ai
      if (!api.questions?.ai?.generateQuestions) {
        alert("AI API is not available");
        return;
      }

      const data = await api.questions.ai.generateQuestions({
        topic: aiTopic,
        numQuestions: Number(aiNumQuestions),
        marksPerQuestion: Number(aiMarks),
      });

      if (!data || !Array.isArray(data)) {
        alert("AI didn’t return questions");
        return;
      }

      const uiQs = data.map(mapAIToUI);
      setAiQuestions(uiQs);
      setAiIndex(0);
      if (uiQs.length > 0) {
        setQuestionForm(uiQs[0]);
      }
    } catch (err) {
      console.error(err);
      alert("AI generation failed");
    }
  };


  // 🔵 go to next AI question (if there are multiple)
  const loadNextAIQuestion = () => {
    if (aiIndex + 1 < aiQuestions.length) {
      const next = aiIndex + 1;
      setAiIndex(next);
      setQuestionForm(aiQuestions[next]);
    } else {
      alert("No more AI questions");
    }
  };

  // Exam details handlers
  const handleExamDataChange = (e) => {
    const { name, value } = e.target;
    setExamData((prev) => ({ ...prev, [name]: value }));
  };

  // Question form handlers
  const handleQuestionFormChange = (e) => {
    const { name, value } = e.target;
    setQuestionForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setQuestionForm((prev) => ({
      ...prev,
      type: newType,
      options: getDefaultOptions(newType),
    }));
  };

  const addOption = () => {
    if (questionForm.type === "MULTIPLE_CHOICE") {
      setQuestionForm((prev) => ({
        ...prev,
        options: [...prev.options, { optionText: "", isCorrect: false }],
      }));
    }
  };

  const handleOptionChange = (index, field, value) => {
    setQuestionForm((prev) => {
      const newOptions = [...prev.options];
      newOptions[index] = { ...newOptions[index], [field]: value };
      return { ...prev, options: newOptions };
    });
  };

  const toggleCorrectOption = (index) => {
    setQuestionForm((prev) => {
      const newOptions = prev.options.map((opt, i) => ({
        ...opt,
        isCorrect: i === index,
      }));
      return { ...prev, options: newOptions };
    });
  };

  const removeOption = (index) => {
    if (
        questionForm.type === "MULTIPLE_CHOICE" &&
        questionForm.options.length > 4
    ) {
      setQuestionForm((prev) => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }));
    }
  };

  const addQuestion = () => {
    if (!questionForm.text.trim()) {
      alert("Question text is required");
      return;
    }
    const correctExists = questionForm.options.some((opt) => opt.isCorrect);
    if (!correctExists) {
      alert("Please mark one option as correct");
      return;
    }
    setQuestions((prev) => [
      ...prev,
      { ...questionForm, id: Date.now().toString() },
    ]);

    // if AI still has more, auto-load next AI q
    if (aiQuestions.length > 0 && aiIndex + 1 < aiQuestions.length) {
      const next = aiIndex + 1;
      setAiIndex(next);
      setQuestionForm(aiQuestions[next]);
    } else {
      // normal reset
      setQuestionForm({
        text: "",
        type: questionForm.type,
        marks: 5,
        isCodeQuestion: false,
        codeSnippet: "",
        options: getDefaultOptions(questionForm.type),
      });
    }
  };

  const handleNextStep = () => {
    if (
        !examData.title ||
        !examData.courseId ||
        !examData.duration ||
        !examData.totalScore
    ) {
      alert("Please fill in all exam details");
      return;
    }
    setStep("add-questions");
  };

  const handleSaveAll = async () => {
    const durationNum = Number(examData.duration);
    const totalScoreNum = Number(examData.totalScore);
    const courseIdNum = Number(examData.courseId);
    if (isNaN(durationNum) || isNaN(totalScoreNum) || isNaN(courseIdNum)) {
      alert("Please enter valid numbers for duration, total score, and select a course");
      return;
    }
    const transformedQuestions = questions.map((q) => {
      const correctOption = q.options.find((opt) => opt.isCorrect);
      return {
        text: q.text,
        marks: q.marks,
        options: q.options,
        correctAnswer: correctOption ? correctOption.optionText : "",
        isCodeQuestion: q.isCodeQuestion,
        codeSnippet: q.codeSnippet,
      };
    });
    const payload = {
      ...examData,
      courseId: courseIdNum,
      duration: durationNum,
      totalScore: totalScoreNum,
      questions: transformedQuestions,
    };
    const examId = await onAddExam(payload);
    if (examId) {
      setExamData({ title: "", courseId: "", duration: 60, totalScore: "" });
      setQuestions([]);
      setAiQuestions([]);
      setAiIndex(0);
      setStep("exam-details");
      onClose();
    }
  };

  const handleBack = () => {
    setStep("exam-details");
  };

  return (
      <Dialog
          open={open}
          onClose={() => {
            setStep("exam-details");
            onClose();
          }}
          fullWidth
          maxWidth="md"
      >
        {step === "exam-details" ? (
            <>
              <DialogTitle>Create New Exam - Exam Details</DialogTitle>
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                        label="Exam Title"
                        name="title"
                        fullWidth
                        value={examData.title}
                        onChange={handleExamDataChange}
                        required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel id="course-select-label">Select Course</InputLabel>
                      <Select
                          labelId="course-select-label"
                          name="courseId"
                          value={examData.courseId}
                          onChange={handleExamDataChange}
                          label="Select Course"
                      >
                        {courses && courses.length > 0 ? (
                            courses.map((course) => (
                                <MenuItem key={course.id} value={course.id}>
                                  {course.name}
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem value="">
                              <em>No courses available</em>
                            </MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                        label="Duration (minutes)"
                        name="duration"
                        type="number"
                        fullWidth
                        value={examData.duration}
                        onChange={handleExamDataChange}
                        required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                        label="Total Score"
                        name="totalScore"
                        type="number"
                        fullWidth
                        value={examData.totalScore}
                        onChange={handleExamDataChange}
                        required
                        helperText="E.g., if you set 10 and each question is 5 points, 2 questions will be selected randomly."
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button
                    onClick={() => {
                      setStep("exam-details");
                      onClose();
                    }}
                >
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleNextStep}>
                  Next: Add Questions
                </Button>
              </DialogActions>
            </>
        ) : (
            <>
              <DialogTitle>Create New Exam - Add Questions</DialogTitle>
              <DialogContent>
                {/* 🔵 AI BOX */}
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
                        size="small"
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                    />
                    <TextField
                        label="No. of questions"
                        type="number"
                        size="small"
                        value={aiNumQuestions}
                        onChange={(e) => setAiNumQuestions(e.target.value)}
                    />
                    <TextField
                        label="Marks"
                        type="number"
                        size="small"
                        value={aiMarks}
                        onChange={(e) => setAiMarks(e.target.value)}
                        helperText="(we’ll keep 5)"
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

                {questions.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6">Questions Preview</Typography>
                      <List>
                        {questions.map((q, idx) => (
                            <React.Fragment key={q.id}>
                              <ListItem>
                                <ListItemText
                                    primary={`${idx + 1}. ${q.text}`}
                                    secondary={`Type: ${q.type}, Marks: ${q.marks}`}
                                />
                              </ListItem>
                              <Divider />
                            </React.Fragment>
                        ))}
                      </List>
                    </Box>
                )}

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                        label="Question Text"
                        name="text"
                        fullWidth
                        value={questionForm.text}
                        onChange={handleQuestionFormChange}
                        required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel id="question-type-label">Question Type</InputLabel>
                      <Select
                          labelId="question-type-label"
                          name="type"
                          value={questionForm.type}
                          onChange={handleTypeChange}
                      >
                        <MenuItem value="MULTIPLE_CHOICE">Multiple Choice</MenuItem>
                        <MenuItem value="TRUE_FALSE">True/False</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                        control={
                          <Switch
                              checked={questionForm.isCodeQuestion}
                              onChange={(e) =>
                                  setQuestionForm((prev) => ({
                                    ...prev,
                                    isCodeQuestion: e.target.checked,
                                  }))
                              }
                          />
                        }
                        label="Include Code Snippet"
                    />
                  </Grid>
                  {questionForm.isCodeQuestion && (
                      <Grid item xs={12}>
                        <TextField
                            label="Code Snippet"
                            name="codeSnippet"
                            fullWidth
                            multiline
                            rows={4}
                            value={questionForm.codeSnippet}
                            onChange={handleQuestionFormChange}
                        />
                      </Grid>
                  )}

                  {/* options */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                      Options (Select one correct option)
                    </Typography>
                  </Grid>
                  {questionForm.options.map((option, index) => (
                      <Grid container item xs={12} spacing={1} key={index}>
                        <Grid item xs={8}>
                          <TextField
                              label={`Option ${index + 1}`}
                              fullWidth
                              value={option.optionText}
                              onChange={(e) =>
                                  handleOptionChange(index, "optionText", e.target.value)
                              }
                          />
                        </Grid>
                        <Grid item xs={2}>
                          <FormControlLabel
                              control={
                                <Switch
                                    checked={option.isCorrect}
                                    onChange={() => toggleCorrectOption(index)}
                                />
                              }
                              label="Correct"
                          />
                        </Grid>
                        <Grid item xs={2}>
                          {questionForm.type === "MULTIPLE_CHOICE" &&
                              questionForm.options.length > 4 && (
                                  <Button
                                      variant="outlined"
                                      onClick={() => removeOption(index)}
                                  >
                                    Remove
                                  </Button>
                              )}
                        </Grid>
                      </Grid>
                  ))}

                  {questionForm.type === "MULTIPLE_CHOICE" && (
                      <Grid item xs={12}>
                        <Button variant="outlined" onClick={addOption}>
                          Add Option
                        </Button>
                      </Grid>
                  )}

                  <Grid item xs={12}>
                    <Button variant="contained" onClick={addQuestion}>
                      Add Question
                    </Button>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleBack}>Back</Button>
                <Button onClick={handleSaveAll} variant="contained">
                  Save All Questions
                </Button>
              </DialogActions>
            </>
        )}
      </Dialog>
  );
};
