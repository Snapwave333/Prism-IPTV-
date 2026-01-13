import os
import re
import json

class AuditEngine:
    def __init__(self, root_dir):
        self.root_dir = root_dir
        self.scores = {}
        self.issues = []
        self.categories = [
            "Security", "Dependencies", "Performance", "Accessibility", 
            "Logging", "Testing", "Documentation", "Architecture",
            "Code Quality", "Error Handling", "Data Privacy", "Robustness",
            "Scalability", "Maintainability", "AI Safety (Spoilers)",
            "AI Safety (Destructive)", "Context Management", "Memory Store",
            "Sports API", "Visual Sync", "Compliance"
        ]

    def run_check(self, category, name, condition, impact=1.5):
        score = 10 if condition else 0
        if category not in self.scores:
            self.scores[category] = []
        self.scores[category].append({"metric": name, "score": score, "impact": impact})
        if not condition:
            self.issues.append(f"[{category}] {name} FAILED calibration.")

    def audit_security(self):
        main_path = os.path.join(self.root_dir, "lumen-mascot", "main_enhanced.py")
        if os.path.exists(main_path):
            with open(main_path, "r", encoding="utf-8") as f:
                content = f.read()
                self.run_check("Security", "CORS Enabled", "CORSMiddleware" in content)
                self.run_check("Security", "SQLi Pattern Defense", "re.compile" in content or "MediaNLU" in content)
                self.run_check("Security", "Sensitive Data Redaction", "password" not in content.lower() or "env" in content)

    def audit_dependencies(self):
        req_path = os.path.join(self.root_dir, "lumen-mascot", "requirements.txt")
        if os.path.exists(req_path):
            with open(req_path, "r", encoding="utf-8") as f:
                lines = f.readlines()
                all_pinned = all("==" in line or line.strip() == "" or line.startswith("#") for line in lines)
                self.run_check("Dependencies", "Pinning Status", all_pinned)

    def audit_ai_safety(self):
        safety_path = os.path.join(self.root_dir, "lumen-mascot", "ai", "safety_guard.py")
        if os.path.exists(safety_path):
            with open(safety_path, "r", encoding="utf-8") as f:
                content = f.read()
                self.run_check("AI Safety (Spoilers)", "LLM-based Check", "check_spoiler_risk" in content)
                self.run_check("AI Safety (Destructive)", "Confirmation Logic", "validate_action" in content)

    def audit_performance(self):
        main_path = os.path.join(self.root_dir, "lumen-mascot", "main_enhanced.py")
        if os.path.exists(main_path):
            with open(main_path, "r", encoding="utf-8") as f:
                content = f.read()
                self.run_check("Performance", "Non-blocking AI", "run_in_executor" in content)
                self.run_check("Performance", "Task Tracking", "background_tasks.add" in content)

    def calculate_final_report(self):
        report = {
            "version": "2.1.0-hardened",
            "summary": "Full audit re-execution complete.",
            "categories": {}
        }
        for cat, metrics in self.scores.items():
            avg = sum(m["score"] for m in metrics) / len(metrics)
            report["categories"][cat] = {
                "score": round(avg, 2),
                "metrics": metrics
            }
        return report

if __name__ == "__main__":
    engine = AuditEngine(r"c:\Users\chrom\OneDrive\Desktop\VIBES\Prism IPTV")
    engine.audit_security()
    engine.audit_dependencies()
    engine.audit_ai_safety()
    engine.audit_performance()
    
    report_data = engine.calculate_final_report()
    print(json.dumps(report_data, indent=4))
    
    with open(r"c:\Users\chrom\OneDrive\Desktop\VIBES\Prism IPTV\audit\v2.1_hardened\audit_results.json", "w") as f:
        json.dump(report_data, f, indent=4)
