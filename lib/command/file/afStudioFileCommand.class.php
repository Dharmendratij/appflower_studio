<?php
/**
 * File command class
 *
 * @package appFlowerStudio
 * @author Sergey Startsev <startsev.sergey@gmail.com>
 */
class afStudioFileCommand extends afBaseStudioCommand
{
    /**
     * Getting tree list
     * 
     * @return afResponse
     */
    protected function processGet()
    {
        $path = afStudioFileCommandHelper::getPath($this->getParameter('path'));
        
        $files = sfFinder::type('any')->ignore_version_control()->maxdepth(0)->in($path);
        
        if (count($files) > 0) {
            return afResponseHelper::create()->success(true)->data(array(), afStudioFileCommandHelper::prepareList($files), 0);
        } 
        
        return afResponseHelper::create()->success(true);
    }
    
    /**
     * Create new dir
     * 
     * @return afResponse
     */
    protected function processNewdir()
    {
        $dir_path = $this->getParameter('dir');
        $dir = afStudioFileCommandHelper::getPath($dir_path);
        
        if (!Util::makeDirectory($dir)) {
            return afResponseHelper::create()->success(false)->message("Cannot create directory {$dir_path}");
        }
        
        return afResponseHelper::create()->success(true);
    }
    
    /**
     * Create new file
     * 
     * @return afResponse
     */
    protected function processNewfile()
    {
        $file_path = $this->getParameter('file');
        $file = afStudioFileCommandHelper::getPath($file_path);
        
        if (!Util::makeFile($file)) {
            return afResponseHelper::create()->success(false)->message("Cannot create file {$file_path}");
        }
        
        return afResponseHelper::create()->success(true);
    }
    
    /**
     * Delete file 
     * 
     * @return afResponse
     */
    protected function processDelete()
    {
        $file_path = $this->getParameter('file');
        $file = afStudioFileCommandHelper::getPath($file_path);
        
        if (!Util::removeResource($file)) {
            return afResponseHelper::create()->success(false)->message('Cannot delete ' . (is_file($file) ? 'file' : 'directory') . ' ' . $file_path);
        }
        
        return afResponseHelper::create()->success(true);
    }
    
    /**
     * Rename file
     * 
     * @return afResponse
     */
    protected function processRename()
    {
        $oldname = $this->getParameter('oldname');
        $new = afStudioFileCommandHelper::getPath($this->getParameter('newname'));
        $old = afStudioFileCommandHelper::getPath($oldname);
        
        if (!Util::renameResource($old, $new)) {
            return afResponseHelper::create()->success(false)->message('Cannot rename ' . (is_file($old) ? 'file' : 'directory') . ' ' . $oldname);
        }
        
        return afResponseHelper::create()->success(true);
    }
    
    /**
     * Upload files
     * 
     * @return afResponse
     */
    protected function processUpload()
    {
        $path = afStudioFileCommandHelper::getPath($this->getParameter('path'));
        
        if (!empty($_FILES)) {
            foreach ($_FILES as $file => $params) {
                if ($params['size'] > 0) {
                    $extension = substr($params['name'], strrpos($params['name'], '.') + 1);
                    $fileName = Util::stripText(substr($params['name'], 0, (strlen($params['name']) - strlen($extension) - 1))) . '.' . $extension;
                    
                    if (!move_uploaded_file($params["tmp_name"], "{$path}/{$fileName}" )) $errors[$file] = 'File upload error';
                }
            }
        }
        
        if (isset($errors)) return afResponseHelper::create()->success(false)->message($errors);
        
        return afResponseHelper::create()->success(true);
    }
    
    /**
     * Getting file content
     *
     * @return afResponse
     * @author Sergey Startsev
     */
    protected function processContent()
    {
        $file = $this->getParameter('file', false);
        $code = $this->getParameter('code', false);
        $is_post = $this->getParameter('is_post', false);
        
        $file = (substr($file, 0, 4) == 'root') ? str_replace('root', afStudioUtil::getRootDir(), substr($file, 0, 4)) . substr($file, 4) : $file;
        
        $response = afResponseHelper::create();
        
        if ($is_post) {
            if ($file && $code && is_writable($file) && afStudioUtil::writeFile($file, $code)) return $response->success(true);
            
            return $response->success(false);
        }
        
        if ($file && $file_content = @file_get_contents($file)) return $response->success(true)->data(array(), $file_content, 0);
        
        return $response->success(false);
    }
    
    /**
     * Getting css files list
     *
     * @return afResponse
     * @author Sergey Startsev
     */
    protected function processCssfiles()
    {
        $cssPath = sfConfig::get('sf_root_dir').'/plugins/appFlowerStudioPlugin/web/css/';
		$cssExtensions = sfFinder::type('file')->name('*.css')->sort_by_name()->in($cssPath);
		
		$i = 0;
		$nodes = array();
		foreach ($cssExtensions as $cssExtension) {
			$cssExtension = str_replace(sfConfig::get('sf_root_dir') . "/plugins/appFlowerStudioPlugin/web/css/", "", $cssExtension);
			$nodes[$i] = array(
				'text' => $cssExtension, 
				'id' => 'css/' . $cssExtension, 
				'leaf' => true
		    );
			$i++;
		}
		
		return afResponseHelper::create()->success(true)->data(array(), $nodes, 0);
    }
    
    
    
}
