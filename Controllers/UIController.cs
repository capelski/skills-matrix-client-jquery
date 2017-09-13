using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;

namespace SkillsMatrix.Controllers
{
    [Route("~/", Name = "default")]
    public class UIController : Controller
    {
        [HttpGet]
        public IActionResult Index()
        {
            return Content(System.IO.File.ReadAllText("wwwroot/Index.html"), "text/html");
        }
    }
}
