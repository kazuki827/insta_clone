import React from 'react';
import styles from './Auth.module.scss';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch } from '../../app/store';
import Modal from 'react-modal';
import { Formik } from 'formik';
import { object, string } from 'yup';
import { TextField, Button, CircularProgress } from '@material-ui/core';

import { fetchAsyncGetPosts, fetchAsyncGetComments } from '../post/postSlice';

import {
  selectIsLoadingAuth,
  selectOpenSignIn,
  selectOpenSignUp,
  setOpenSignIn,
  resetOpenSignIn,
  setOpenSignUp,
  resetOpenSignUp,
  fetchCredStart,
  fetchCredEnd,
  fetchAsyncLogin,
  fetchAsyncRegister,
  fetchAsyncGetMyProf,
  fetchAsyncGetProfs,
  fetchAsyncCreateProf,
} from './authSlice';

const customStyles = {
  overlay: {
    backgroundColor: '#777777',
  },
  content: {
    top: '55%',
    left: '50%',

    width: 280,
    height: 350,
    padding: '50px',

    transform: 'translate(-50%, -50%)',
  },
};

const Auth: React.FC = () => {
  Modal.setAppElement('#root');
  const openSignIn = useSelector(selectOpenSignIn); // initial: true
  const openSignUp = useSelector(selectOpenSignUp); // initial: false
  const isLoadingAuth = useSelector(selectIsLoadingAuth);
  const dispatch: AppDispatch = useDispatch();

  return (
    <>
      {/* register用modal */}
      <Modal
        isOpen={openSignUp}
        // modal以外をclick
        onRequestClose={async () => {
          await dispatch(resetOpenSignUp());
        }}
        style={customStyles}
      >
        <Formik
          initialErrors={{ email: 'required' }}
          initialValues={{ email: '', password: '' }}
          // valuesにuserが入力した値(object)が入ってくる
          onSubmit={async (values) => {
            await dispatch(fetchCredStart());
            const resultReg = await dispatch(fetchAsyncRegister(values));

            // 新規ユーザーが無事に作成された時
            if (fetchAsyncRegister.fulfilled.match(resultReg)) {
              await dispatch(fetchAsyncLogin(values));
              // LocalStorageにJWTトークン格納 (fetchAsyncLoginの後処理)
              await dispatch(fetchAsyncCreateProf({ nickName: 'anonymous' }));

              await dispatch(fetchAsyncGetProfs());
              await dispatch(fetchAsyncGetPosts());
              await dispatch(fetchAsyncGetComments());
              await dispatch(fetchAsyncGetMyProf());
            }
            await dispatch(fetchCredEnd());
            await dispatch(resetOpenSignUp());
          }}
          validationSchema={object().shape({
            email: string().email('email format is wrong').required('email is must'),
            password: string().required('password is must').min(4),
          })}
        >
          {({ handleSubmit, handleChange, handleBlur, values, errors, touched, isValid }) => (
            <div>
              <form onSubmit={handleSubmit}>
                <div className={styles.auth_signUp}>
                  <h1 className={styles.auth_title}>Instagram clone</h1>
                  <br />
                  <div className={styles.auth_progress}>{isLoadingAuth && <CircularProgress />}</div>
                  <br />

                  <TextField
                    placeholder="email"
                    type="input"
                    name="email"
                    // handleChangeがformikのvalidationを毎回走らせる
                    onChange={handleChange}
                    // 入力フォームからforcusが外れた時、formikのvalidationを毎回走らせる
                    onBlur={handleBlur}
                    value={values.email}
                  />
                  <br />
                  {/* touched => 一度でもforcusされたらtrue */}
                  {touched.email && errors.email ? <div className={styles.auth_error}>{errors.email}</div> : null}

                  <TextField
                    placeholder="password"
                    type="password"
                    name="password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password}
                  />
                  {touched.password && errors.password ? (
                    <div className={styles.auth_error}>{errors.password}</div>
                  ) : null}
                  <br />
                  <br />

                  <Button variant="contained" color="primary" disabled={!isValid} type="submit">
                    Register
                  </Button>
                  <br />
                  <br />
                  <span
                    className={styles.auth_text}
                    onClick={async () => {
                      await dispatch(setOpenSignIn());
                      await dispatch(resetOpenSignUp());
                    }}
                  >
                    You already have a account ?
                  </span>
                </div>
              </form>
            </div>
          )}
        </Formik>
      </Modal>

      {/* login用modal */}
      <Modal
        isOpen={openSignIn}
        onRequestClose={async () => {
          await dispatch(resetOpenSignIn());
        }}
        style={customStyles}
      >
        <Formik
          initialErrors={{ email: 'required' }}
          initialValues={{ email: '', password: '' }}
          onSubmit={async (values) => {
            await dispatch(fetchCredStart());
            const result = await dispatch(fetchAsyncLogin(values));
            if (fetchAsyncLogin.fulfilled.match(result)) {
              await dispatch(fetchAsyncGetProfs());
              await dispatch(fetchAsyncGetPosts());
              await dispatch(fetchAsyncGetComments());
              await dispatch(fetchAsyncGetMyProf());
            }
            await dispatch(fetchCredEnd());
            await dispatch(resetOpenSignIn());
          }}
          validationSchema={object().shape({
            email: string().email('email format is wrong').required('email is must'),
            password: string().required('password is must').min(4),
          })}
        >
          {({ handleSubmit, handleChange, handleBlur, values, errors, touched, isValid }) => (
            <div>
              <form onSubmit={handleSubmit}>
                <div className={styles.auth_signUp}>
                  <h1 className={styles.auth_title}>Instagram clone</h1>
                  <br />
                  <div className={styles.auth_progress}>{isLoadingAuth && <CircularProgress />}</div>
                  <br />

                  <TextField
                    placeholder="email"
                    type="input"
                    name="email"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.email}
                  />
                  {touched.email && errors.email ? <div className={styles.auth_error}>{errors.email}</div> : null}
                  <br />

                  <TextField
                    placeholder="password"
                    type="password"
                    name="password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password}
                  />
                  {touched.password && errors.password ? (
                    <div className={styles.auth_error}>{errors.password}</div>
                  ) : null}
                  <br />
                  <br />
                  <Button variant="contained" color="primary" disabled={!isValid} type="submit">
                    Login
                  </Button>
                  <br />
                  <br />
                  <span
                    className={styles.auth_text}
                    onClick={async () => {
                      await dispatch(resetOpenSignIn());
                      await dispatch(setOpenSignUp());
                    }}
                  >
                    You don't have a account ?
                  </span>
                </div>
              </form>
            </div>
          )}
        </Formik>
      </Modal>
    </>
  );
};

export default Auth;
