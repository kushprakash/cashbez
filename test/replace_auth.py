import os
import re

# Define the pattern to find
old_pattern = r'''        // Get token from header
        if \(\$request->hasHeader\('Token'\)\) \{
            \$authHeader = \$request->header\('Token'\);
        \} else \{
            return response\(\)->json\(\[
                'status' => 0,
                'message' => 'No token provided',
            \], 400\);
        \}

        // Find user by token
        \$user = User::where\('remember_token', \$authHeader\)->first\(\);
        if \(!\$user\) \{
            return response\(\)->json\(\[
                'status' => 0,
                'message' => 'Invalid token',
            \], 401\);
        \}'''

# Define the replacement
replacement = "        $user=$request->get('user');"

def process_file(filepath):
    """Process a single PHP file to replace authentication blocks"""
    try:
        with open(filepath, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Count matches
        matches = len(re.findall(old_pattern, content, re.MULTILINE))
        
        if matches > 0:
            print(f"Processing {os.path.basename(filepath)} - Found {matches} authentication blocks")
            
            # Replace all occurrences
            new_content = re.sub(old_pattern, replacement, content, flags=re.MULTILINE)
            
            # Write back to file
            with open(filepath, 'w', encoding='utf-8') as file:
                file.write(new_content)
                
            print(f"Updated {os.path.basename(filepath)}")
            return True
        
        return False
        
    except Exception as e:
        print(f"Error processing {filepath}: {str(e)}")
        return False

def main():
    """Main function to process all controller files"""
    controllers_dir = r"e:\xampp\htdocs\project\app\Http\Controllers"
    
    if not os.path.exists(controllers_dir):
        print(f"Controllers directory not found: {controllers_dir}")
        return
    
    processed_count = 0
    
    # Process all PHP files in the controllers directory
    for filename in os.listdir(controllers_dir):
        if filename.endswith('.php') and filename not in ['Controller.php', 'AttendanceController.php']:
            filepath = os.path.join(controllers_dir, filename)
            if process_file(filepath):
                processed_count += 1
    
    print(f"\nCompleted! Processed {processed_count} controller files.")

if __name__ == "__main__":
    main()
