const WraperFunct = (fn) => {
    Promise.resolve(fn()).catch(error => next(error))
}

export default WraperFunct

// For async-await & try-catch 

// const wrapperfunc = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         console.log(error)
//     }
// }

// export default wrapperfunc