import React, { useEffect, useState } from 'react';
import { Button } from '@material-ui/core';
import Pagination from '@material-ui/lab/Pagination';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { modalActions } from '@/store/actions';
import { CommentItem } from '@/components/elements/comment';
import Recipe from '@/api/Recipe';

import classes from './RecipeComments.module.scss';
import { useDispatch } from 'react-redux';

const ResipeComments = ({
  id,
  userId,
  children,
  updateComments,
  addComment,
  uploadLikeHandler,
  deleteCommentHandle
}) => {
  const isAuthorized = useSelector(state => state.account.hasToken);

  const dispatch = useDispatch();

  const [comments, setComments] = useState();

  const placeholder = 'Add your comments here...';
  const authError = 'Please login first, then you will can comment recipes!';

  // Pagination for comments
  const itemsPerPage = 4;
  const [page, setPage] = useState(1);
  const [numberOfPages, setNumberOfPages] = useState();

  const formik = useFormik({
    initialValues: {
      textarea: ''
    },
    validationSchema: Yup.object({
      textarea: Yup.string()
        .min(5, 'Must be 5 characters or more')
        .max(300, 'Must be 300 characters or less')
        .required('Write something before submit...')
    }),
    onSubmit: values => {
      uploadComment(values);
    }
  });

  useEffect(() => {
    if (id) {
      getComments();
    }
  }, [page, id]);

  const getComments = async () => {
    try {
      let response;

      if (updateComments) {
        response = await updateComments({ recipeId: id, page });
      } else {
        response = await Recipe.getComments({ recipeId: id, page });
      }

      setNumberOfPages(countCommentsPages(response.data.count));
      setComments(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  const countCommentsPages = count => {
    const isRemainExists = count % itemsPerPage > 0;
    let pages = Math.floor(count / itemsPerPage);
    return isRemainExists ? ++pages : pages;
  };

  const uploadComment = async ({ textarea }) => {
    if (!isAuthorized) {
      return;
    }

    try {
      const targetComment = {
        id: +id,
        text: textarea
      };

      let response;
      if (updateComments) {
        response = await addComment(targetComment);
      } else {
        response = await Recipe.uploadComments(targetComment);
      }

      if (response.status === 201) {
        getComments();
        formik.values.textarea = '';
      }
    } catch (e) {
      console.log(e);
    }
  };

  const deleteComment = async commentId => {
    try {
      let response;

      if (deleteCommentHandle) {
        response = await deleteCommentHandle(commentId);
      } else {
        response = await Recipe.deleteComment(commentId);
      }

      if (response.status === 204) {
        getComments();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const openUnregisterModal = name => {
    return () => {
      dispatch(modalActions.open(name)).then(result => {
        // result when modal return promise and close
      });
    };
  };

  return (
    <div className={classes.comments}>
      <h2 className={classes.comments__title}>Write a comment</h2>
      <span className={classes.comments__lineContainer}>
        <span className={classes.comments__yellowLine} />
        <span className={classes.comments__blueСircle} />
      </span>

      {children && <div className={classes.comments__rating}>{children}</div>}

      <form className={classes.comments__form} onSubmit={formik.handleSubmit}>
        <textarea
          className={classes.comments__input}
          id="textarea"
          name="textarea"
          placeholder={placeholder}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.textarea}
        />

        {formik.touched.textarea && formik.errors.textarea ? (
          <div className={classes.comments__input__error}>{formik.errors.textarea}</div>
        ) : null}

        {!isAuthorized && <div className={classes.comments__input__error}>{authError}</div>}
        <div
          className={classes.comments__form__btnWrap}
          onClick={!isAuthorized ? openUnregisterModal('unregisterActivityModal') : null}>
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
        </div>
      </form>

      <div className={classes.comments__body}>
        <h3 className={classes.comments__subtitle}>Comments ({comments && comments.count})</h3>

        {comments?.results?.length !== 0 &&
          comments?.results.map((comment, index) => {
            return (
              <CommentItem
                user={comment?.user}
                userId={userId}
                key={`${comment?.pk}-${index + 1}`}
                text={comment?.text}
                likesNumber={comment?.likes_number}
                dislikesNumber={comment?.dislikes_number}
                commentId={comment?.pk}
                createdAt={comment?.created_at}
                deleteComment={deleteComment}
                uploadLikeHandler={uploadLikeHandler}
              />
            );
          })}

        {comments?.results?.length !== 0 && (
          <Pagination
            classes={{ root: classes.comments__pagination }}
            count={numberOfPages}
            onChange={(event, page) => setPage(page)}
          />
        )}
      </div>
    </div>
  );
};

export default ResipeComments;
