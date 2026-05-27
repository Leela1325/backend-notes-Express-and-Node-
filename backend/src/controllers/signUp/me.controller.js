const me = async (req , res) => {
    res.status(200).send(req.user) ;
}

export default me