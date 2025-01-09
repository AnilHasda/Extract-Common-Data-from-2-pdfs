const ErrorHandler=(error,req,res,next)=>{
  let message=error.message?error.message:"internal server error";
 let statusCode=error.statusCode || 500;
 let success=error.success || false;
 res.status(statusCode).json({statusCode,message,success});
}
export default ErrorHandler;