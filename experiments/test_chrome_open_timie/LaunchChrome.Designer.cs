namespace test_chrome_open_timie
{
    partial class LaunchChrome
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.btnOpenChrome = new System.Windows.Forms.Button();
            this.lblTime = new System.Windows.Forms.Label();
            this.SuspendLayout();
            // 
            // btnOpenChrome
            // 
            this.btnOpenChrome.Location = new System.Drawing.Point(71, 154);
            this.btnOpenChrome.Name = "btnOpenChrome";
            this.btnOpenChrome.Size = new System.Drawing.Size(190, 55);
            this.btnOpenChrome.TabIndex = 0;
            this.btnOpenChrome.Text = "Open Chrome";
            this.btnOpenChrome.UseVisualStyleBackColor = true;
            this.btnOpenChrome.Click += new System.EventHandler(this.btnOpenChrome_Click);
            // 
            // lblTime
            // 
            this.lblTime.AutoSize = true;
            this.lblTime.Font = new System.Drawing.Font("Microsoft Sans Serif", 16.2F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.lblTime.Location = new System.Drawing.Point(47, 71);
            this.lblTime.Name = "lblTime";
            this.lblTime.Size = new System.Drawing.Size(86, 32);
            this.lblTime.TabIndex = 1;
            this.lblTime.Text = "Time:";
            // 
            // LaunchChrome
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(351, 279);
            this.Controls.Add(this.lblTime);
            this.Controls.Add(this.btnOpenChrome);
            this.Name = "LaunchChrome";
            this.Text = "LaunchChrome";
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Button btnOpenChrome;
        private System.Windows.Forms.Label lblTime;
    }
}

