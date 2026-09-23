import axios from "axios";

const API = axios.create({
  baseURL:
    
    "http://localhost:5000/api",

  withCredentials: true,
});

/*
========================================
GET ALL
========================================
*/

export const getAllReadings = async () => {
  const response =
    await API.get("/reading");

  return response.data;
};

/*
========================================
GET BY ID
========================================
*/

export const getReadingById = async (
  id
) => {
  const response =
    await API.get(`/reading/${id}`);

  return response.data;
};

/*
========================================
GET BY GRADE
========================================
*/

export const getReadingByGrade = async (
  grade
) => {
  const response =
    await API.get(
      `/reading/grade/${grade}`
    );

  return response.data;
};

/*
========================================
SUBMIT RESULT
========================================
*/

export const submitReadingResult =
  async (data) => {
    const response =
      await API.post(
        "/reading/result",
        data
      );

    return response.data;
  };

/*
========================================
GET STUDENT RESULTS
========================================
*/

export const getStudentResults =
  async (studentId) => {
    const response =
      await API.get(
        `/reading/results/student/${studentId}`
      );

    return response.data;
  };