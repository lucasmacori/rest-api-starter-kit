import {Router, Request, Response} from 'express'
const router = Router()
const mainRoute = router.route("/")

mainRoute.get((req: Request, res: Response) => {
  res.send(`This API is working !`)
})

export default router