import { useState } from 'react'

const useForm = (initValues, successCallback, fieldValidators) => {
  const [values, setValues] = useState({ ...initValues })

  const [dirtyInit, setDirtyInit] = useState({ ...initValues })
  const [validState, setValidState] = useState(false)


  if (
    dirtyInit !== true &&
    JSON.stringify(dirtyInit) !== JSON.stringify(initValues)
  ) {
    setValues({ ...initValues })
    setDirtyInit(true)
  }

  const [errors, setErrors] = useState({})
  const [ , setIsSubmitting] = useState(false)

  const validate = fieldValues => {
    let newErrors = {}
    let oldErrors = { ...errors }
    Object.keys(fieldValues).forEach(field => {
      const value = fieldValues[field]
      let valitationExps = fieldValidators[field]
      if (typeof valitationExp === 'function') {
        valitationExps = [valitationExps]
      }
      Array.isArray(valitationExps) &&
        valitationExps.forEach(valitationExp => {
          if (
            typeof valitationExp === 'function' &&
            !newErrors[field] &&
            valitationExp(value, values)
          ) {
            if (oldErrors[field]) {
              return
            }
            newErrors[field] = valitationExp(value)
          } else {
            delete oldErrors[field]
          }
        })
    })
    return { ...oldErrors, ...newErrors }
  }

  const formSubmit =  e => {
    e.preventDefault()
    let anyErrors = validate(values)
    setValidState(true)
    if (Object.keys(anyErrors).length === 0) {
      setIsSubmitting(true)
      successCallback(values)
      setIsSubmitting(false)
    } else {
      setErrors(anyErrors)
    }
  }

  const fieldChange = ({target}) => {
    let { name, value } = target
    setValues(values => ({
      ...values,
      [name]: value
    }))
    if (validState) setErrors(validate({ [name]: value }))
  }

  const resetForm = () => setValues({...initValues})

  return {
    fieldChange,
    formSubmit,
    resetForm,
    values,
    errors
  }
}

export default useForm

const emailRegex = /\S+@\S+\.\S+/

export const isRequired = value => !value && 'Field is required'

export const isEmail = value =>
  !emailRegex.test(value) && 'Field must be a valid email'

export const customValidation = (method, message) => (
    value,
    allvalue
  ) => method(value, allvalue) && message
