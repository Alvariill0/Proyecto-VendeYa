import { useState, useCallback } from 'react';

/**
 * Hook personalizado para manejar formularios
 * @param {Object} initialValues - Valores iniciales del formulario
 * @param {Function} onSubmit - Función a ejecutar al enviar el formulario
 * @param {Function} validate - Función para validar el formulario
 * @returns {Object} Estado y funciones para manejar el formulario
 */
function useForm(initialValues = {}, onSubmit = () => {}, validate = () => ({})) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitCount, setSubmitCount] = useState(0);

    // Restablecer el formulario a los valores iniciales
    const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
    }, [initialValues]);

    // Manejar cambios en los campos del formulario
    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;
        
        setValues(prevValues => ({
            ...prevValues,
            [name]: fieldValue
        }));
    }, []);

    // Manejar cambios directos en los valores (útil para componentes personalizados)
    const setFieldValue = useCallback((name, value) => {
        setValues(prevValues => ({
            ...prevValues,
            [name]: value
        }));
    }, []);

    // Marcar un campo como tocado
    const handleBlur = useCallback((e) => {
        const { name } = e.target;
        
        setTouched(prevTouched => ({
            ...prevTouched,
            [name]: true
        }));
    }, []);

    // Marcar un campo como tocado directamente
    const setFieldTouched = useCallback((name, isTouched = true) => {
        setTouched(prevTouched => ({
            ...prevTouched,
            [name]: isTouched
        }));
    }, []);

    // Validar el formulario
    const validateForm = useCallback(() => {
        const validationErrors = validate(values);
        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    }, [values, validate]);

    // Manejar el envío del formulario
    const handleSubmit = useCallback(async (e) => {
        if (e) e.preventDefault();
        
        // Marcar todos los campos como tocados
        const allTouched = Object.keys(values).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {});
        setTouched(allTouched);
        
        // Validar el formulario
        const isValid = validateForm();
        setSubmitCount(prev => prev + 1);
        
        if (isValid) {
            setIsSubmitting(true);
            try {
                await onSubmit(values);
            } catch (error) {
                console.error('Error al enviar el formulario:', error);
            } finally {
                setIsSubmitting(false);
            }
        }
    }, [values, validateForm, onSubmit]);

    return {
        values,
        errors,
        touched,
        isSubmitting,
        submitCount,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
        setFieldTouched,
        resetForm,
        validateForm
    };
}

export default useForm;