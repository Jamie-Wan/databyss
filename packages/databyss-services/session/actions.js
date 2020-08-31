import request from '../lib/request'
import { NotAuthorizedError } from '../interfaces'

import {
  FETCH_SESSION,
  CACHE_SESSION,
  DENY_ACCESS,
  REQUEST_CODE,
  END_SESSION,
  CACHE_PUBLIC_SESSION,
} from './constants'

import {
  setAuthToken,
  getAuthToken,
  deleteAuthToken,
  getAccountId,
  setAccountId,
  deleteAccountId,
} from './clientStorage'

import { getAccountFromLocation } from './_helpers'

export const fetchSession = ({
  _request,
  ...credentials
}) => async dispatch => {
  // eslint-disable-next-line no-param-reassign
  _request = _request || request

  const { code, googleCode, email } = credentials

  dispatch({ type: FETCH_SESSION, payload: { credentials } })

  // fetch params
  let path = process.env.API_URL
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }

  try {
    const authToken = getAuthToken()
    const accountId = getAccountId()

    if (authToken && accountId) {
      // if not at at root path '/' and accountID is not the same as the one in the url, set as guest account
      if (
        getAccountFromLocation() &&
        (accountId !== getAccountFromLocation() ||
          !window.location.pathname === '/')
      ) {
        // get account from url
        const _accountId = getAccountFromLocation()
        path += '/auth'
        options.headers['x-databyss-as-account'] = _accountId
      } else {
        // if we have the token, try to use it
        path += '/auth'
        options.headers['x-databyss-account'] = accountId
        options.headers['x-auth-token'] = authToken
      }
    } else if (googleCode) {
      // google oAuth token
      path += '/users/google'
      options.body = JSON.stringify({ code: googleCode })
    } else if (code && email) {
      // code from email
      path += '/auth/code'
      options.body = JSON.stringify({ code, email })
    } else if (email) {
      // register with email
      path += '/users/email'
      options.body = JSON.stringify({ email })
    } else {
      // get account from url
      const _accountId = getAccountFromLocation()
      path += '/auth'
      options.headers['x-databyss-as-account'] = _accountId
    }

    const res = await _request(path, options, true)
    if (res.data && res.data.session) {
      // authenticated
      setAuthToken(res.data.session.token)
      setAccountId(res.data.session.account._id)
      dispatch({
        type: CACHE_SESSION,
        payload: {
          session: res.data.session,
        },
      })
    } else if (res.data?.isPublic) {
      // cache public account info in session state
      dispatch({
        type: CACHE_PUBLIC_SESSION,
        payload: { publicAccount: res.data.accountId },
      })
    } else {
      // assume TFA, request code
      dispatch({
        type: REQUEST_CODE,
        payload: { email },
      })
    }
  } catch (error) {
    deleteAuthToken()
    deleteAccountId()
    dispatch({
      type: DENY_ACCESS,
      payload: { error },
    })
    if (!(error instanceof NotAuthorizedError)) {
      throw error
    }
  }
}

export const endSession = () => {
  deleteAuthToken()
  deleteAccountId()

  return {
    type: END_SESSION,
  }
}
