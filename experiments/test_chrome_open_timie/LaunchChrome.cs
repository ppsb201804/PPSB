using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace test_chrome_open_timie
{
    public partial class LaunchChrome : Form
    {
        public LaunchChrome()
        {
            InitializeComponent();
        }

        private void btnOpenChrome_Click(object sender, EventArgs e)
        {
            DateTime Epoch = new DateTime(1970, 1, 1);
            long begTime = (long)(DateTime.UtcNow - Epoch).TotalMilliseconds;

            Process.Start("chrome.exe", @"file:///E:/Github_Private/SafeBrowsing/experiments/test_chrome_open_timie/testChrome.html");

            lblTime.Text = begTime.ToString();

        }
    }
}
