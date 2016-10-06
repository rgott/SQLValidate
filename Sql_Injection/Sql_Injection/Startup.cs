using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(Sql_Injection.Startup))]
namespace Sql_Injection
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
