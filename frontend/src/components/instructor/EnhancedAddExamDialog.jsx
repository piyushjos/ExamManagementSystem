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
  Box
} from "@mui/material";

export const EnhancedAddExamDialog = ({ open, onClose, onAddExam, courses }) => {
  // Exam details include title, course, duration, and totalScore.
  const [examData, setExamData] = useState({
    title: "",
    courseId: "",
    duration: 60,
    totalScore: "",
  });
  // questions will be an array of question objects.
  const [questions, setQuestions] = useState([]);
  // Step control: "exam-details" or "add-questions"
  const [step, setStep] = useState("exam-details");

  // For question form, we lock marks to 5.
  const getDefaultOptions = (type) => {
    if (type === "TRUE_FALSE") {
      return [
        { optionText: "True", isCorrect: false },
        { optionText: "False", isCorrect: false },
      ];
    }
    // MULTIPLE_CHOICE: default 4 options.
    return [
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
    ];
  };

  const [questionForm, setQuestionForm] = useState({
    text: "",
    type: "MULTIPLE_CHOICE", // only allow MULTIPLE_CHOICE and TRUE_FALSE
    marks: 5, // locked to 5
    isCodeQuestion: false,
    codeSnippet: "",
    options: getDefaultOptions("MULTIPLE_CHOICE"),
  });

  // Handlers for exam details
  const handleExamDataChange = (e) => {
    const { name, value } = e.target;
    setExamData((prev) => ({ ...prev, [name]: value }));
  };

  // Handlers for question form
  const handleQuestionFormChange = (e) => {
    const { name, value } = e.target;
    setQuestionForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setQuestionForm((prev) => ({
      ...prev,
      type: newType,
      // Reset options based on type
      options: getDefaultOptions(newType),
    }));
  };

  const addOption = () => {
    // For multiple choice only; TRUE_FALSE already has 2 fixed options.
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
    // Only one option can be marked as correct.
    setQuestionForm((prev) => {
      const newOptions = prev.options.map((opt, i) => ({
        ...opt,
        isCorrect: i === index,
      }));
      return { ...prev, options: newOptions };
    });
  };

  const removeOption = (index) => {
    // For MULTIPLE_CHOICE: allow removal if there are more than 4 options.
    if (questionForm.type === "MULTIPLE_CHOICE" && questionForm.options.length > 4) {
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
    // Ensure at least one option is marked as correct.
    const correctExists = questionForm.options.some((opt) => opt.isCorrect);
    if (!correctExists) {
      alert("Please mark one option as correct");
      return;
    }
    // Add the question with a unique id.
    setQuestions((prev) => [
      ...prev,
      { ...questionForm, id: Date.now().toString() },
    ]);
    // Reset question form to defaults (based on current type).
    setQuestionForm({
      text: "",
      type: questionForm.type, // keep the same type selection
      marks: 5,
      isCodeQuestion: false,
      codeSnippet: "",
      options: getDefaultOptions(questionForm.type),
    });
  };

  const handleNextStep = () => {
    // Validate exam details
    if (!examData.title || !examData.courseId || !examData.duration || !examData.totalScore) {
      alert("Please fill in all exam details");
      return;
    }
    setStep("add-questions");
  };

  const handleSaveAll = async () => {
    // Convert examData fields to numbers
    const durationNum = Number(examData.duration);
    const totalScoreNum = Number(examData.totalScore);
    const courseIdNum = Number(examData.courseId);
    if (isNaN(durationNum) || isNaN(totalScoreNum) || isNaN(courseIdNum)) {
      alert("Please enter valid numbers for duration, total score, and select a course");
      return;
    }
    // Transform questions: for each question, stringify options and derive correctAnswer
    const transformedQuestions = questions.map((q) => {
      const correctOption = q.options.find((opt) => opt.isCorrect);
      return {
        text: q.text,
        marks: q.marks, // always 5
        options: JSON.stringify(q.options),
        correctAnswer: correctOption ? correctOption.optionText : "",
        isCodeQuestion: q.isCodeQuestion,
        codeSnippet: q.codeSnippet,
      };
    });
    // Create payload with exam details and questions.
    const payload = {
      ...examData,
      courseId: courseIdNum,
      duration: durationNum,
      totalScore: totalScoreNum,
      questions: transformedQuestions,
    };
    const examId = await onAddExam(payload);
    if (examId) {
      // Reset everything.
      setExamData({ title: "", courseId: "", duration: 60, totalScore: "" });
      setQuestions([]);
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
              {/* Options Section */}
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
                        <Button variant="outlined" onClick={() => removeOption(index)}>
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

// export { EnhancedAddExamDialog };
