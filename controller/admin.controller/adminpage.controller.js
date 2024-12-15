
const config = require('../../config/index');
module.exports = {
    login: (req, res) => {
        console.error(req.headers.host );
        res.render("admin/login", {
          title: "Admin Login",
          host: config.pre + req.headers.host,
          year: new Date().getFullYear(),
          project_title: config.project_name,
        });
      },

      dashboard: async (req, res) => {
        var data = {};
        data.distributor_count = 1
        data.user_count = 1
        data.fb_user_count = 1
        data.vip_user_count = 1
        data.todaysignupusers = 1
        data.guest_count = 1
        data.game_count = 1
        data.game_counttoday = 1
        data.most_preferred = 1
        data.latest_user = [{username:"username",email:"email"}]
        data.graph_data = 1
        data.totalbankdeposit = 1
        data.todaybankdeposit = 1
        data.referral = 1
        data.totaldeposite = 1
        data.totalAmountToday = 1
        data.totalbankbalance = 1
        data.totalbalance = 1
        // data.totalbanktobank = 1
        // data.todaybanktobank = 1
        data.todaybankwithdrawl = 1
        data.totalprofit = 1
        data.pokerProfit = 1
        // req.admin.role = "ALL" ;
        console.log(req.admin ,req.admin)
        res.render("admin/index", {
          title: "Dashboard",
          type: "dashboard",
          sub: "dashboard",
          sub2: "",
          host: config.pre + req.headers.host,
          admin: req.admin,
          data: data,
        });
      },


      profile: (req, res) => {
        res.render("admin/profile", {
          title: "Admin Profile",
          type: "profile",
          sub: "profile",
          sub2: "",
          host: config.pre + req.headers.host,
          admin: req.admin,
        });
      },

      users: async (req, res) => {
        
        const users = [{referral_code:"code" ,username:"username",email:"email" , is_guest : true ,game_played : 90 , wallet :1 , bank : 76  ,created_at:788 }]
        res.render("admin/user", {
          title: "User List",
          type: "users",
          sub: "user",
          sub2: "",
          host: config.pre + req.headers.host,
          admin: req.admin,
          data: [],
          total: 1,
        });
      },
}