﻿namespace Sql_Injection.Models
{
    public class SqlViewModel
    {
        public string sqlQuery { get; set; }
        public bool? isValid { get; set; }
        public string ExplainationText { get; set; }
        public string ID { get; set; }
    }
}