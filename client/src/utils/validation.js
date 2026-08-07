export function validateComplaintForm(values) {
  const errors = {};

  if (!values.customerName.trim()) {
    errors.customerName = "Customer name is required";
  } else if (values.customerName.trim().length < 2) {
    errors.customerName = "Name must be at least 2 characters";
  }

  if (!values.mobile.trim()) {
    errors.mobile = "Mobile number is required";
  } else if (!/^[+]?[0-9\s\-]{7,15}$/.test(values.mobile.trim())) {
    errors.mobile = "Enter a valid mobile number";
  }

  if (values.email.trim()) {
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
      errors.email = "Enter a valid email address";
    }
  }

  if (!values.orderId.trim()) {
    errors.orderId = "Order ID is required";
  }

  if (!values.productName.trim()) {
    errors.productName = "Product name is required";
  }

  if (!values.category) {
    errors.category = "Please select a category";
  }

  if (!values.description.trim()) {
    errors.description = "Description is required";
  } else if (values.description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters";
  } else if (values.description.trim().length > 2000) {
    errors.description = "Description cannot exceed 2000 characters";
  }

  return errors;
}

export function validateLoginForm(values) {
  const errors = {};

  if (!values.email.trim()) {
    errors.email = "Email address is required";
  } else if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address";
  }

  if (!values.password) {
    errors.password = "Password is required";
  }

  return errors;
}

export function validateRegisterForm(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = "Full name is required";
  } else if (values.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (!values.email.trim()) {
    errors.email = "Email address is required";
  } else if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  return errors;
}