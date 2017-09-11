using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace SkillsMatrix.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return Content(System.IO.File.ReadAllText("wwwroot/Index.html"), "text/html");
        }

        public IActionResult Error()
        {
            return View();
        }
    }
}
