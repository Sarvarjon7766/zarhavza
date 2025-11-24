const UserService = require('../services/user.service')

class UserController{
	async create(req,res){
		try {
			const result = await UserService.create(req.body)
			if(result.success){
				return res.status(201).json(result)
			}else{
				return res.status(400).json(result)
			}
		} catch (error) {
			console.log(error)
			return res.status(500).json({success:false,message:"Server xatosi"})
		}
	}
	async auth(req,res){
		try {
			const result = await UserService.auth(req.body)
			if(result.success){
				return res.status(200).json(result)
			}else{
				return res.status(400).json(result)
			}
		} catch (error) {
			console.log(error)
			return res.status(500).json({success:false,message:"Server xatosi"})
		}
	}
}
module.exports = new UserController()