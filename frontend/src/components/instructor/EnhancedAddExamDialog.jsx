import React, { useEffect, useState } from "react";
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
  ListItemButton,
  ListItemText,
  Divider,
  Typography,
  Switch,
  FormControlLabel,
  Box,
  IconButton,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import api from '../../services/api.js'

export const EnhancedAddExamDialog = ({
  open,
  onClose,
  onAddExam,
  courses,
  mode = "create",
  initialExam = null,
  onUpdateExam,
}) => {
  const isEditMode = mode === "edit";

  const getDefaultExamData = () => ({
    title: "",
    courseId: "",
    duration: 60,
    totalScore: "",
  });

  // Exam details
  const [examData, setExamData] = useState(getDefaultExamData);

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

  const getQuestionTypeLabel = (type) => {
    if (!type) return "Unknown";
    return type.replace(/_/g, " ");
  };

  const createEmptyQuestionForm = (type = "MULTIPLE_CHOICE") => ({
    text: "",
    type,
    marks: 5,
    isCodeQuestion: false,
    codeSnippet: "",
    options: getDefaultOptions(type),
  });

  // Question form (what user is currently editing)
  const [questionForm, setQuestionForm] = useState(createEmptyQuestionForm());
  const [editingIndex, setEditingIndex] = useState(null);
  const isEditing = editingIndex !== null;

  const resetDialogState = (type = "MULTIPLE_CHOICE") => {
    setExamData(getDefaultExamData());
    setQuestions([]);
    setEditingIndex(null);
    setQuestionForm(createEmptyQuestionForm(type));
    setStep("exam-details");
    setAiTopic("");
    setAiNumQuestions(5);
    setAiMarks(5);
    setAiQuestions([]);
    setAiIndex(0);
  };

  const mapExistingQuestionToUI = (existing) => {
    const optionSource = Array.isArray(existing?.options) ? existing.options : [];
    const normalizedOptions =
      optionSource.length > 0
        ? optionSource.map((opt) => ({
            optionText: opt?.optionText ?? opt?.text ?? "",
            isCorrect:
              typeof opt?.isCorrect === "boolean"
                ? opt.isCorrect
                : Boolean(opt?.correct),
          }))
        : getDefaultOptions(existing?.type || "MULTIPLE_CHOICE");

    if (!normalizedOptions.some((opt) => opt.isCorrect) && normalizedOptions.length > 0) {
      normalizedOptions[0].isCorrect = true;
    }

    return {
      id: existing?.id ?? null,
      text: existing?.text ?? existing?.questionText ?? "",
      type: existing?.type || "MULTIPLE_CHOICE",
      marks: existing?.marks ?? 5,
      isCodeQuestion: existing?.isCodeQuestion ?? false,
      codeSnippet: existing?.codeSnippet ?? "",
      options: normalizedOptions.map((opt) => ({ ...opt })),
    };
  };

  const handleDialogClose = () => {
    resetDialogState();
    onClose();
  };

  const dialogTitlePrefix = isEditMode ? "Edit Exam" : "Create New Exam";

  useEffect(() => {
    if (!open) {
      return;
    }

    if (isEditMode) {
      if (!initialExam) {
        return;
      }

      const courseSource = initialExam.courseId ?? initialExam.course?.id;
      const courseIdValue = courseSource ? String(courseSource) : "";

      setExamData({
        title: initialExam.title || "",
        courseId: courseIdValue,
        duration: initialExam.duration ?? 60,
        totalScore: initialExam.totalScore ?? "",
      });

      const normalizedQuestions = (initialExam.questions || []).map((question) =>
        mapExistingQuestionToUI(question)
      );

      setQuestions(normalizedQuestions);
      setStep("exam-details");
      setAiTopic("");
      setAiNumQuestions(5);
      setAiMarks(5);
      setAiQuestions([]);
      setAiIndex(0);

      if (normalizedQuestions.length > 0) {
        const firstQuestion = normalizedQuestions[0];
        setEditingIndex(0);
        setQuestionForm({
          ...firstQuestion,
          options: (firstQuestion.options || []).map((opt) => ({ ...opt })),
        });
      } else {
        setEditingIndex(null);
        setQuestionForm(createEmptyQuestionForm());
      }
    } else {
      resetDialogState();
    }
  }, [open, isEditMode, initialExam]);

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
        const firstQuestion = uiQs[0];
        setQuestionForm({
          ...firstQuestion,
          options: (firstQuestion.options || getDefaultOptions(firstQuestion.type)).map(
              (opt) => ({ ...opt })
          ),
        });
        setEditingIndex(null);
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
      const nextQuestion = aiQuestions[next];
      setQuestionForm({
        ...nextQuestion,
        options: (nextQuestion.options || getDefaultOptions(nextQuestion.type)).map(
            (opt) => ({ ...opt })
        ),
      });
      setEditingIndex(null);
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

  const resetQuestionForm = (type) => {
    const targetType = type || questionForm.type || "MULTIPLE_CHOICE";
    setQuestionForm(createEmptyQuestionForm(targetType));
  };

  const handleEditQuestion = (index) => {
    const selected = questions[index];
    if (!selected) {
      return;
    }
    setEditingIndex(index);
    setQuestionForm({
      ...selected,
      options: (selected.options || getDefaultOptions(selected.type)).map((opt) => ({
        ...opt,
      })),
    });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    resetQuestionForm();
  };

  const handleDeleteQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    setEditingIndex((prev) => {
      if (prev === null) {
        return null;
      }
      if (prev === index) {
        resetQuestionForm();
        return null;
      }
      if (prev > index) {
        return prev - 1;
      }
      return prev;
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
    const sanitizedQuestion = {
      ...questionForm,
      options: questionForm.options.map((opt) => ({ ...opt })),
    };

    if (isEditing) {
      setQuestions((prev) => {
        const updated = [...prev];
        if (!updated[editingIndex]) {
          return prev;
        }
        updated[editingIndex] = {
          ...sanitizedQuestion,
          id: updated[editingIndex].id,
        };
        return updated;
      });
      setEditingIndex(null);
      resetQuestionForm(sanitizedQuestion.type);
      return;
    }

    setQuestions((prev) => [
      ...prev,
      { ...sanitizedQuestion, id: Date.now().toString() },
    ]);

    // if AI still has more, auto-load next AI q
    if (aiQuestions.length > 0 && aiIndex + 1 < aiQuestions.length) {
      const next = aiIndex + 1;
      setAiIndex(next);
      const nextQuestion = aiQuestions[next];
      setQuestionForm({
        ...nextQuestion,
        options: (nextQuestion.options || getDefaultOptions(nextQuestion.type)).map(
            (opt) => ({ ...opt })
        ),
      });
      setEditingIndex(null);
    } else {
      // normal reset
      resetQuestionForm(sanitizedQuestion.type);
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
    const courseIdNum = examData.courseId ? Number(examData.courseId) : Number.NaN;

    if (Number.isNaN(durationNum) || Number.isNaN(totalScoreNum)) {
      alert("Please enter valid numbers for duration and total score");
      return;
    }

    if (!isEditMode && (Number.isNaN(courseIdNum) || courseIdNum <= 0)) {
      alert("Please select a course for the exam");
      return;
    }

    const baseQuestionData = questions.map((q) => {
      const correctOption = q.options.find((opt) => opt.isCorrect);
      return {
        question: q,
        correctAnswer: correctOption ? correctOption.optionText : "",
      };
    });

    const createQuestionPayload = baseQuestionData.map(({ question, correctAnswer }) => ({
      text: question.text,
      marks: question.marks,
      options: question.options,
      correctAnswer,
      isCodeQuestion: question.isCodeQuestion,
      codeSnippet: question.codeSnippet,
    }));

    const updateQuestionPayload = baseQuestionData.map(({ question, correctAnswer }) => {
      const item = {
        questionText: question.text,
        marks: question.marks,
        options: question.options,
        correctAnswer,
      };
      if (typeof question.id === "number") {
        item.id = question.id;
      }
      return item;
    });

    try {
      if (isEditMode) {
        if (!onUpdateExam || !initialExam?.id) {
          console.error("Edit mode triggered without update handler or exam id");
          alert("Unable to update this exam right now. Please try again.");
          return;
        }

        const updatePayload = {
          title: examData.title,
          duration: durationNum,
          totalScore: totalScoreNum,
          numberOfQuestions: questions.length,
          questions: updateQuestionPayload,
        };

        const updatedExam = await onUpdateExam(initialExam.id, updatePayload);
        if (updatedExam) {
          handleDialogClose();
        }
        return;
      }

      const payload = {
        title: examData.title,
        courseId: courseIdNum,
        duration: durationNum,
        totalScore: totalScoreNum,
        questions: createQuestionPayload,
      };

      const examId = await onAddExam(payload);
      if (examId) {
        handleDialogClose();
      }
    } catch (err) {
      console.error("Failed to save exam", err);
      alert(isEditMode ? "Failed to update exam. Please try again." : "Failed to create exam. Please try again.");
    }
  };

  const handleBack = () => {
    setStep("exam-details");
    setEditingIndex(null);
  };

  return (
      <Dialog
          open={open}
          onClose={handleDialogClose}
          fullWidth
          maxWidth="md"
      >
        {step === "exam-details" ? (
            <>
              <DialogTitle>{`${dialogTitlePrefix} - Exam Details`}</DialogTitle>
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
                          disabled={isEditMode}
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
                <Button onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleNextStep}>
                  Next: Add Questions
                </Button>
              </DialogActions>
            </>
        ) : (
            <>
              <DialogTitle>{`${dialogTitlePrefix} - Add Questions`}</DialogTitle>
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

                <Grid container spacing={2} sx={{ alignItems: { xs: "stretch", md: "flex-start" } }}>
                  <Grid item xs={12} md={7} sx={{ display: "flex" }}>
                    <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                      <Grid item xs={12}>
                        <TextField
                            label="Question Text"
                            name="text"
                            multiline
                            minRows={3}
                            maxRows={6}
                            fullWidth
                            value={questionForm.text}
                            onChange={handleQuestionFormChange}
                            required
                            sx={{
                              "& .MuiInputBase-root": {
                                alignItems: "flex-start",
                              },
                              "& textarea": {
                                resize: "vertical",
                              },
                            }}
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
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                          <Button variant="contained" onClick={addQuestion}>
                            {isEditing ? "Update Question" : "Add Question"}
                          </Button>
                          {isEditing && (
                              <Button variant="text" onClick={handleCancelEdit}>
                                Cancel Edit
                              </Button>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                      item
                      xs={12}
                      md={5}
                      sx={{
                        display: "flex",
                        maxHeight: { xs: 460, md: "calc(100vh - 320px)" },
                        minHeight: 0,
                      }}
                  >
                    <Box
                        sx={{
                          border: "1px solid #e0e0e0",
                          borderRadius: 1,
                          p: 2,
                          bgcolor: "#fafafa",
                          boxShadow: 1,
                          minHeight: { xs: 280, md: 320 },
                          maxHeight: "100%",
                          flexGrow: 1,
                          display: "flex",
                          flexDirection: "column",
                          overflow: "hidden",
                        }}
                    >
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        Added Questions
                      </Typography>
                      {questions.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            No questions added yet.
                          </Typography>
                      ) : (
                          <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Click a question to review or edit.
                            </Typography>
                            <List
                                dense
                                sx={{
                                  flexGrow: 1,
                                  overflowY: "auto",
                                  pr: 1,
                                  pt: 0,
                                  pb: 0,
                                  minHeight: 0,
                                  scrollbarWidth: "thin",
                                }}
                            >
                              {questions.map((q, idx) => (
                                  <React.Fragment key={q.id}>
                                    <ListItem disablePadding sx={{ alignItems: "flex-start" }}>
                                      <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: 0.5,
                                            width: "100%",
                                          }}
                                      >
                                        <ListItemButton
                                            onClick={() => handleEditQuestion(idx)}
                                            selected={editingIndex === idx}
                                            sx={{
                                              flex: 1,
                                              alignItems: "flex-start",
                                              flexDirection: "column",
                                              gap: 0.5,
                                              "&.Mui-selected": {
                                                bgcolor: "action.selected",
                                                "&:hover": { bgcolor: "action.selected" },
                                              },
                                            }}
                                        >
                                          <ListItemText
                                              primary={`${idx + 1}. ${q.text}`}
                                              primaryTypographyProps={{
                                                fontWeight: 600,
                                                color: "text.primary",
                                              }}
                                              secondary={
                                                <Box component="span" sx={{ display: "block", mt: 0.5 }}>
                                                  <Typography variant="caption" color="text.secondary">
                                                    {`Type: ${getQuestionTypeLabel(q.type)} • Marks: ${q.marks ?? "N/A"}`}
                                                  </Typography>
                                                  {Array.isArray(q.options) && q.options.length > 0 && (
                                                      <Box
                                                          component="ul"
                                                          sx={{
                                                            pl: 2,
                                                            mt: 0.5,
                                                            mb: 0,
                                                            typography: "body2",
                                                          }}
                                                      >
                                                        {q.options.map((opt, optionIdx) => (
                                                            <Box
                                                                component="li"
                                                                key={optionIdx}
                                                                sx={{
                                                                  color: opt.isCorrect ? "success.main" : "text.primary",
                                                                  fontWeight: opt.isCorrect ? 600 : 400,
                                                                  listStyleType: "disc",
                                                                }}
                                                            >
                                                              {(opt.optionText || `Option ${optionIdx + 1}`).trim()}
                                                              {opt.isCorrect ? " (Correct)" : ""}
                                                            </Box>
                                                        ))}
                                                      </Box>
                                                  )}
                                                </Box>
                                              }
                                          />
                                        </ListItemButton>
                                        <IconButton
                                            edge="end"
                                            color="error"
                                            size="small"
                                            aria-label={`Delete question ${idx + 1}`}
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              handleDeleteQuestion(idx);
                                            }}
                                            sx={{ mt: 0.5 }}
                                        >
                                          <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    </ListItem>
                                    <Divider component="li" />
                                  </React.Fragment>
                              ))}
                            </List>
                          </Box>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleBack}>Back</Button>
                <Button onClick={handleSaveAll} variant="contained">
                  {isEditMode ? "Update Exam" : "Save All Questions"}
                </Button>
              </DialogActions>
            </>
        )}
      </Dialog>
  );
};
