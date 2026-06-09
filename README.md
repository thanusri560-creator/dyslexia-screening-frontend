# VoxLexi - AI-Based Dyslexia Detection System

## Overview

VoxLexi is an AI-powered dyslexia detection platform designed to assist in the early identification of dyslexia through speech analysis. The system analyzes a child's reading patterns, pronunciation, fluency, and speech characteristics using machine learning techniques to determine the likelihood of dyslexia.

The goal of this project is to provide a non-invasive, accessible, and efficient screening tool that can support educators, parents, and healthcare professionals in identifying potential reading difficulties at an early stage.

---

## Features

- Speech recording and audio upload
- Audio preprocessing and noise reduction
- Feature extraction from speech signals
- Machine learning-based dyslexia prediction
- User-friendly interface
- Reading assessment using age-appropriate words and sentences
- Prediction results with confidence score
- Secure storage and management of audio data

---

## System Architecture

The system consists of the following modules:

1. User Interface Module
2. Audio Acquisition Module
3. Audio Preprocessing Module
4. Feature Extraction Module
5. Machine Learning Classification Module
6. Result Generation Module
7. Database Management Module

### Workflow

1. User reads the provided words, sentences, or paragraphs.
2. Speech is recorded through the application.
3. Audio preprocessing removes noise and unwanted disturbances.
4. Relevant speech features are extracted.
5. The trained machine learning model analyzes the extracted features.
6. The system predicts whether dyslexia indicators are present.
7. Results are displayed through the user interface.

---

## Technology Stack

### Frontend
- React.js
- HTML5
- CSS3
- JavaScript

### Backend
- Python
- Flask / FastAPI

### Machine Learning & Audio Processing
- Scikit-learn
- Librosa
- NumPy
- Pandas

### Database
- MySQL / MongoDB

### Development Tools
- VS Code
- Git
- GitHub

---

## Dataset

The dataset consists of speech recordings collected from children of different age groups. Participants are asked to read predefined words, sentences, and paragraphs categorized into easy, moderate, and difficult levels.

The dataset includes:

- Multiple age groups
- Dyslexic and non-dyslexic speech samples
- Reading tasks of varying difficulty levels
- Audio recordings for speech analysis

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/thanusri560-creator/dyslexia-screening-frontend/tree/main/dyslexiacur2
cd voxlexi
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run Backend

```bash
python app.py
```

or

```bash
uvicorn main:app --reload
```

### Run Frontend

```bash
npm install
npm start
```

---

## Project Structure

```text
VoxLexi/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── preprocessing/
│   ├── feature_extraction/
│   └── app.py
│
├── dataset/
│
├── trained_models/
│
├── documentation/
│
├── requirements.txt
│
└── README.md
```

---

## Conclusion

The proposed system provides an effective approach for the early detection of dyslexia using speech analysis and machine learning. By analyzing pronunciation, reading fluency, and speech patterns, the system assists in identifying potential learning difficulties in a non-invasive and accessible manner. The integration of audio processing techniques and intelligent classification models makes the platform a valuable tool for supporting educators, parents, and healthcare professionals in the early screening process.

---

## Future Enhancements

- Real-time speech analysis and feedback
- Multilingual support
- Mobile application development
- Personalized learning recommendations
- Deep learning-based prediction models
- Integration with handwriting analysis
- Cloud-based deployment
- Enhanced reporting and progress tracking

---

## Contributors

-Team Members:
- A.Anusha-24251A0501
- VinayaSri-24251A0516
- Mounya-24251A0542
- S.Sai Thanusri-24251A0560
  

---

## License

This project is developed for educational and research purposes.

---

## Acknowledgements

We thank all participants, educators, and contributors who supported the data collection, development, testing, and evaluation of this project.
