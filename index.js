const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const connection = require('./database/database')
const session = require('express-session')

const categoriesController = require('./categories/CategoriesController')
const articlesController = require('./articles/articlesController')
const usersController = require('./user/userController')

const Article = require('./articles/articles')
const Category = require('./categories/categorys')

//View engine
app.set('view engine', 'ejs')

//sessions
app.use(session({
    //express session tem storage, storage é onde a sessao ficara salva, por padrao é ser salvo na memoria ram
    //as sessoes sao salvas mas nao sao destruidas, isso pode causar problemas pois sobrecarrega a memoria ram do computador
    secret:"qualquerCoisa", 
    cookie:{ maxAge: 30000}
}))

//Static
app.use(express.static('public'))

//Body Parser
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

//Database
connection.authenticate()
    .then(() =>{
        console.log('conexao feita com sucesso!')
    }).catch((error) =>{
        console.log(error)
    })



app.use('/', categoriesController)
app.use('/', articlesController)
app.use('/', usersController)


app.get('/', (req,res)=>{
    Article.findAll({
        order:[
            ['id', 'DESC']
        ],
        limit: 4
    }).then(articles =>{
        Category.findAll().then(categories =>{
            res.render('index', {articles, categories})
        })
    })
})

app.get('/:slug', (req,res) =>{
    var slug = req.params.slug
    Article.findOne({
        where:{
            slug:slug
        }
    }).then(article =>{
        if(article != undefined){
            res.render('article', {article:article});
        }else{
            res.redirect('/')
        }
    }).catch(err =>{
        res.redirect('/')
    })
})

app.get('/category/:slug', (req,res) =>{
    var slug = req.params.slug

    Category.findOne({
        where:{
            slug:slug
        },
        include:[{model: Article}]
    }).then(category =>{
        if(category != undefined){
            Category.findAll().then(categories =>{
                res.render('index',{articles: category.articles, categories: categories})
            })
        }else{
            res.redirect('/')
        }
    }).catch(err =>{
        res.redirect('/')
    })
})

app.listen(8080, ()=>{
    console.log('o servidor esta rodando')
})