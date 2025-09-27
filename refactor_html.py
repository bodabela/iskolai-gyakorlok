import os
from pathlib import Path
from bs4 import BeautifulSoup

def refactor_html_file(html_path: Path):
    """
    Refactors a single HTML file by extracting embedded style and script tags.
    """
    print(f"-> Processing: {html_path}")
    
    css_path = html_path.with_suffix(".css")
    js_path = html_path.with_suffix(".js")

    # Condition: refactor if corresponding .css AND .js files do not exist
    if css_path.exists() or js_path.exists():
        print(f"   - Skipping: Corresponding .css or .js file already exists.")
        return

    try:
        with open(html_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        soup = BeautifulSoup(content, 'html.parser')
        
        modified = False
        
        # --- CSS EXTRACTION ---
        style_tag = soup.find('style')
        if style_tag and style_tag.string:
            css_content = style_tag.string.strip()
            if css_content:
                print(f"  - Extracting CSS to {css_path.name}")
                with open(css_path, 'w', encoding='utf-8') as f_css:
                    f_css.write(css_content)
                
                new_link_tag = soup.new_tag('link', rel='stylesheet', href=f'{css_path.name}')
                style_tag.replace_with(new_link_tag)
                modified = True
        
        # --- JS EXTRACTION ---
        # Find the last script tag that has content and no 'src' attribute
        embedded_scripts = [s for s in soup.find_all('script') if not s.has_attr('src') and s.string]
        
        if embedded_scripts:
            # The task specifies the last embedded script tag
            script_to_extract = embedded_scripts[-1]
            js_content = script_to_extract.string.strip()
            
            if js_content:
                print(f"  - Extracting JS to {js_path.name}")
                with open(js_path, 'w', encoding='utf-8') as f_js:
                    f_js.write(js_content)
                
                new_script_tag = soup.new_tag('script', src=f'{js_path.name}')
                script_to_extract.replace_with(new_script_tag)
                modified = True

        # --- SAVE MODIFIED HTML ---
        if modified:
            modified_html = str(soup)
            
            with open(html_path, 'w', encoding='utf-8') as f_html:
                f_html.write(modified_html)
            print(f"  - Updated {html_path.name}")
        else:
            print(f"   - No changes made to {html_path.name}")

    except Exception as e:
        print(f"  - ERROR processing {html_path}: {e}")

def run_refactoring(root_dir):
    """
    Finds all HTML files in root_dir and applies refactoring.
    """
    print(f"Starting refactoring process in directory: {root_dir}")
    html_files_found = list(Path(root_dir).rglob("*.html"))
    print(f"Found {len(html_files_found)} HTML files to check.")
    
    for html_file_path in html_files_found:
        refactor_html_file(html_file_path)
    
    print("Refactoring process finished.")

if __name__ == "__main__":
    # The script is expected to be in the project root.
    # The target directory is 'public'.
    public_directory = 'public'
    if not os.path.isdir(public_directory):
        print(f"Error: Directory '{public_directory}' not found.")
        print("Please run this script from the project's root directory.")
    else:
        run_refactoring(public_directory)
