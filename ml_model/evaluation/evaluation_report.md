
# Model Evaluation Report

Project: NekoAI AI Companion

Best Model:
Linear Regression

Evaluation Results:

            Model      MAE       MSE     RMSE       R2
Linear Regression 0.002483  0.000008 0.002872 1.000000
    Decision Tree 3.949753 24.902658 4.990256 0.903325
    Random Forest 2.002689  6.464533 2.542545 0.974904

Top Important Features:

            Feature  Importance
                age    0.001556
             gender    0.000441
study_hours_per_day    0.540231
        sleep_hours    0.113333
  phone_usage_hours    0.108373
 social_media_hours    0.002316
      youtube_hours    0.002284
       gaming_hours    0.002242
     breaks_per_day    0.001633
   coffee_intake_mg    0.002301

Conclusion:

The selected model will be integrated into the FastAPI backend and used by the NekoAI companion to predict user productivity.
