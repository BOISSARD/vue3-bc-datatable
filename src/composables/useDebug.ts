export default function() {

    function debugTime() {
        let date = new Date()
        return date.toLocaleTimeString() + "." + date.getMilliseconds()
    }

    return {
        debugTime
    }  
}
